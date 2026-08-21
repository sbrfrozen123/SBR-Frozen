import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CashflowClient from './cashflow-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Kas & Bank | SBR Frozen',
}

export default async function CashflowPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const userBranchId = await getBranchContext(supabase, user.id)
  
  const { data: branchData } = await supabase
    .from('branches')
    .select('bank_name_1, bank_account_1, bank_name_2, bank_account_2')
    .eq('id', userBranchId)
    .single()

  // Get all data needed for cashflow
  const [
      { data: cashTxns },
      { data: posTxns },
      { data: expenseTxns },
      { data: purchaseTxns },
      { data: debtPaymentsTxns },
      { data: supplierPaymentsTxns }
    ] = await Promise.all([
      supabase
        .from('cash_transactions')
        .select('id, type, amount, payment_method, payment_account, description, transaction_date, created_at, user_id, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10000),
      userBranchId ? supabase.from('transactions').select('id, amount_paid, payment_method, payment_account, created_at, invoice_number').eq('branch_id', userBranchId).neq('status', 'voided').neq('order_status', 'cancelled') : supabase.from('transactions').select('id, amount_paid, payment_method, payment_account, created_at, invoice_number').neq('status', 'voided').neq('order_status', 'cancelled'),
      userBranchId ? supabase.from('expenses').select('id, amount, payment_method, payment_account, created_at, description').eq('branch_id', userBranchId) : supabase.from('expenses').select('id, amount, payment_method, payment_account, created_at, description'),
      userBranchId ? supabase.from('purchases').select('id, total_amount, amount_paid, payment_method, payment_status, payment_account, created_at').eq('branch_id', userBranchId) : supabase.from('purchases').select('id, total_amount, amount_paid, payment_method, payment_status, payment_account, created_at'),
      userBranchId ? supabase.from('debt_payments').select('id, amount, payment_method, payment_account, created_at').eq('branch_id', userBranchId) : supabase.from('debt_payments').select('id, amount, payment_method, payment_account, created_at'),
      userBranchId ? supabase.from('supplier_payments').select('id, amount, payment_method, payment_account, created_at').eq('branch_id', userBranchId) : supabase.from('supplier_payments').select('id, amount, payment_method, payment_account, created_at')
    ])

    // Calculate Balances dynamically from ALL transactions
  let cashBalance = 0
  let undefinedBankBalance = 0
  const bankBalances: Record<string, number> = {}
  
  if (branchData?.bank_name_1) bankBalances[branchData.bank_name_1] = 0;
  if (branchData?.bank_name_2) bankBalances[branchData.bank_name_2] = 0;

  // Helper to add/sub based on payment account
  const addBank = (amount: number, account?: string | null) => {
    if (!account) {
      undefinedBankBalance += amount;
      return;
    }
    if (bankBalances[account] === undefined) bankBalances[account] = 0;
    bankBalances[account] += amount;
  }
  const subBank = (amount: number, account?: string | null) => {
    if (!account) {
      undefinedBankBalance -= amount;
      return;
    }
    if (bankBalances[account] === undefined) bankBalances[account] = 0;
    bankBalances[account] -= amount;
  }

  // 1. Manual Cash Transactions
  ;(cashTxns || []).forEach(ct => {
    if (ct.type === 'saldo_awal') {
      if (ct.payment_method === 'tunai') cashBalance += ct.amount
      else addBank(ct.amount, ct.payment_account)
    } else if (ct.type === 'setor_kas') {
      if (ct.payment_method === 'tunai') cashBalance += ct.amount
      else addBank(ct.amount, ct.payment_account)
    } else if (ct.type === 'tarik_kas') {
      if (ct.payment_method === 'tunai') cashBalance -= ct.amount
      else subBank(ct.amount, ct.payment_account)
    } else if (ct.type === 'mutasi_ke_bank') {
      cashBalance -= ct.amount
      addBank(ct.amount, ct.payment_account)
    } else if (ct.type === 'mutasi_ke_kas') {
      subBank(ct.amount, ct.payment_account)
      cashBalance += ct.amount
    }
  })

  // 2. POS Sales
  ;(posTxns || []).forEach(tx => {
    if (tx.amount_paid > 0) {
      if (tx.payment_method === 'tunai') cashBalance += tx.amount_paid
      else if (['transfer_bank', 'transfer', 'qris'].includes(tx.payment_method)) addBank(tx.amount_paid, tx.payment_account)
    }
  })

  // 3. Expenses
  ;(expenseTxns || []).forEach(ex => {
    if (ex.payment_method === 'tunai') cashBalance -= ex.amount
    else if (['transfer_bank', 'transfer', 'qris'].includes(ex.payment_method)) subBank(ex.amount, ex.payment_account)
  })

  // 4. Purchases
  ;(purchaseTxns || []).forEach(pu => {
    if (pu.amount_paid > 0) {
      if (pu.payment_method === 'tunai') cashBalance -= pu.amount_paid
      else if (['transfer_bank', 'transfer', 'qris'].includes(pu.payment_method)) subBank(pu.amount_paid, pu.payment_account)
    }
  })

  // 5. Debt Payments
  ;(debtPaymentsTxns || []).forEach(dp => {
    if (dp.payment_method === 'tunai') cashBalance += dp.amount
    else if (['transfer_bank', 'transfer', 'qris'].includes(dp.payment_method)) addBank(dp.amount, dp.payment_account)
  })

  // 6. Supplier Payments
  ;(supplierPaymentsTxns || []).forEach(sp => {
    if (sp.payment_method === 'tunai') cashBalance -= sp.amount
    else if (['transfer_bank', 'transfer', 'qris'].includes(sp.payment_method)) subBank(sp.amount, sp.payment_account)
  })

  

  const bankBalance = Object.values(bankBalances).reduce((a,b) => a+b, 0) + undefinedBankBalance

  return (
    <CashflowClient 
      userId={user.id}
      branchId={userBranchId || ''}
      initialCash={cashBalance}
      initialBank={bankBalance}
      bankBalances={bankBalances}
      undefinedBankBalance={undefinedBankBalance}
      branchData={branchData}
      history={cashTxns || []}
    />
  )
}
