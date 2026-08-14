import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import FinancialSummaryClient from './financial-summary-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Ringkasan Keuangan | SBR Frozen',
}

export default async function FinancialSummaryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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

  const from = searchParams?.from as string
  const to = searchParams?.to as string
  const branch_id = searchParams?.branch as string

  // Fetch branches for filter
  const { data: branches } = await supabase.from('branches').select('id, name')

  let transactions: any[] = []
  let debtPayments: any[] = []

  if (from && to) {
    let txnsQuery = supabase.from('transactions').select('id, amount_paid, payment_method, created_at, branch_id, profiles(full_name)')
    let debtQuery = supabase.from('debt_payments').select('id, amount, payment_method, payment_date, branch_id, profiles(full_name)')

    if (branch_id && branch_id !== 'all') {
      txnsQuery = txnsQuery.eq('branch_id', branch_id)
      debtQuery = debtQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      txnsQuery = txnsQuery.eq('branch_id', userBranchId)
      debtQuery = debtQuery.eq('branch_id', userBranchId)
    }

    txnsQuery = txnsQuery.gte('created_at', `${from}T00:00:00Z`).lte('created_at', `${to}T23:59:59Z`).neq('payment_method', 'tempo')
    debtQuery = debtQuery.gte('payment_date', `${from}T00:00:00Z`).lte('payment_date', `${to}T23:59:59Z`)

    const [
      { data: txnsData },
      { data: debtData }
    ] = await Promise.all([
      txnsQuery,
      debtQuery
    ])

    transactions = txnsData || []
    debtPayments = debtData || []
  }

  return (
    <FinancialSummaryClient 
      transactions={transactions}
      debtPayments={debtPayments}
      branches={branches || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
    />
  )
}
