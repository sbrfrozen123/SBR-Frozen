import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ProfitLossClient from './profit-loss-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laba Rugi | SBR Frozen',
}

export default async function ProfitLossPage({
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
  let transactionItems: any[] = []
  let expenses: any[] = []

  if (from && to) {
    let txnsQuery = supabase.from('transactions').select('id, total_amount, created_at, branch_id')
    let itemsQuery = supabase.from('transaction_items').select('id, qty, hpp_snapshot, transactions!inner(created_at, branch_id)')
    let expensesQuery = supabase.from('expenses').select('id, amount, expense_date, category, branch_id')

    if (branch_id && branch_id !== 'all') {
      txnsQuery = txnsQuery.eq('branch_id', branch_id)
      itemsQuery = itemsQuery.eq('transactions.branch_id', branch_id)
      expensesQuery = expensesQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      txnsQuery = txnsQuery.eq('branch_id', userBranchId)
      itemsQuery = itemsQuery.eq('transactions.branch_id', userBranchId)
      expensesQuery = expensesQuery.eq('branch_id', userBranchId)
    }

    txnsQuery = txnsQuery.gte('created_at', `${from}T00:00:00Z`).lte('created_at', `${to}T23:59:59Z`)
    itemsQuery = itemsQuery.gte('transactions.created_at', `${from}T00:00:00Z`).lte('transactions.created_at', `${to}T23:59:59Z`)
    expensesQuery = expensesQuery.gte('expense_date', from).lte('expense_date', to)

    const [
      { data: txnsData },
      { data: itemsData },
      { data: expData }
    ] = await Promise.all([
      txnsQuery,
      itemsQuery,
      expensesQuery
    ])

    transactions = txnsData || []
    transactionItems = itemsData || []
    expenses = expData || []
  }

  return (
    <ProfitLossClient 
      transactions={transactions}
      transactionItems={transactionItems}
      expenses={expenses}
      branches={branches || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
    />
  )
}
