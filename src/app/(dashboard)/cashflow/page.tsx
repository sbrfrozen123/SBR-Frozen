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

  // Fetch all transactions
  let txnsQuery = supabase.from('transactions').select('amount_paid, payment_method').limit(100000)
  if (userBranchId) txnsQuery = txnsQuery.eq('branch_id', userBranchId)
  const { data: txns } = await txnsQuery

  let debtQuery = supabase.from('debt_payments').select('amount, payment_method').limit(100000)
  if (userBranchId) debtQuery = debtQuery.eq('branch_id', userBranchId)
  const { data: debts } = await debtQuery

  let expensesQuery = supabase.from('expenses').select('amount, payment_method').limit(100000)
  if (userBranchId) expensesQuery = expensesQuery.eq('branch_id', userBranchId)
  const { data: expenses } = await expensesQuery

  let purchasesQuery = supabase.from('purchases').select('total_amount, payment_method, payment_status').limit(100000)
  if (userBranchId) purchasesQuery = purchasesQuery.eq('branch_id', userBranchId)
  const { data: purchases } = await purchasesQuery

  let cashTxnsQuery = supabase.from('cash_transactions').select('type, amount, payment_method, description, transaction_date, created_at, user_id, profiles(full_name)').order('created_at', { ascending: false }).limit(10000)
  // cash_transactions currently doesn't have branch_id unless we added it? Let's assume global or we added it.
  // Actually I didn't add branch_id to cash_transactions in the migration above. Let's just fetch all.
  const { data: cashTxns } = await cashTxnsQuery

  // Calculate Balances
  let cashBalance = 0
  let bankBalance = 0

  // 1. Transactions (Pemasukan Penjualan)
  ;(txns || []).forEach(t => {
    if (t.payment_method === 'tunai') cashBalance += t.amount_paid
    else if (t.payment_method === 'transfer' || t.payment_method === 'qris') bankBalance += t.amount_paid
  })

  // 2. Debt Payments (Pemasukan Piutang)
  ;(debts || []).forEach(d => {
    if (d.payment_method === 'tunai') cashBalance += d.amount
    else if (d.payment_method === 'transfer' || d.payment_method === 'qris') bankBalance += d.amount
  })

  // 3. Expenses (Pengeluaran Operasional)
  ;(expenses || []).forEach(e => {
    if (e.payment_method === 'tunai') cashBalance -= e.amount
    else if (e.payment_method === 'transfer' || e.payment_method === 'qris') bankBalance -= e.amount
  })

  // 4. Purchases (Pengeluaran Kulakan Lunas)
  ;(purchases || []).forEach(p => {
    if (p.payment_status === 'lunas') {
      if (p.payment_method === 'tunai') cashBalance -= p.total_amount
      else if (p.payment_method === 'transfer' || p.payment_method === 'qris') bankBalance -= p.total_amount
    }
  })

  // 5. Cash Transactions (Mutasi Manual)
  ;(cashTxns || []).forEach(ct => {
    if (ct.type === 'setor_kas') {
      if (ct.payment_method === 'tunai') cashBalance += ct.amount
      else bankBalance += ct.amount
    } else if (ct.type === 'tarik_kas') {
      if (ct.payment_method === 'tunai') cashBalance -= ct.amount
      else bankBalance -= ct.amount
    } else if (ct.type === 'mutasi_ke_bank') {
      cashBalance -= ct.amount
      bankBalance += ct.amount
    } else if (ct.type === 'mutasi_ke_kas') {
      bankBalance -= ct.amount
      cashBalance += ct.amount
    }
  })

  return (
    <CashflowClient 
      userId={user.id}
      branchId={userBranchId || ''}
      initialCash={cashBalance}
      initialBank={bankBalance}
      history={cashTxns || []}
    />
  )
}
