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

  const { data: cashTxns } = await supabase
    .from('cash_transactions')
    .select('id, type, amount, payment_method, description, transaction_date, created_at, user_id, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(10000)

  // Calculate Balances ONLY from cash_transactions (mutasi manual + saldo awal)
  let cashBalance = 0
  let bankBalance = 0

  ;(cashTxns || []).forEach(ct => {
    if (ct.type === 'saldo_awal') {
      // Saldo awal: payment_method menentukan ke kas atau bank
      if (ct.payment_method === 'tunai') cashBalance += ct.amount
      else bankBalance += ct.amount
    } else if (ct.type === 'setor_kas') {
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
