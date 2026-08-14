import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ProfitLossClient from './profit-loss-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laba Rugi | SBR Frozen',
}

export default async function ProfitLossPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  // We need to fetch transactions, transaction_items, and expenses for the client to filter.
  // In a large app, we'd query specifically per month. Here we just fetch enough data (e.g. recent months) 
  // or rely on client filtering for simplicity in this demo.
  
  // We'll fetch all data since it's an MVP, but ideally this should be paginated or date-bound.
  const branchId = await getBranchContext(supabase, user.id)

  let txnsQuery = supabase.from('transactions').select('id, total_amount, created_at')
  let itemsQuery = supabase.from('transaction_items').select('id, qty, created_at, products(hpp), transactions!inner(branch_id)')
  let expensesQuery = supabase.from('expenses').select('id, amount, expense_date')

  if (branchId) {
    txnsQuery = txnsQuery.eq('branch_id', branchId)
    itemsQuery = itemsQuery.eq('transactions.branch_id', branchId)
    expensesQuery = expensesQuery.eq('branch_id', branchId)
  }

  const [
    { data: transactions },
    { data: transactionItems },
    { data: expenses }
  ] = await Promise.all([
    txnsQuery,
    itemsQuery,
    expensesQuery
  ])

  return (
    <ProfitLossClient 
      transactions={transactions || []}
      transactionItems={transactionItems || []}
      expenses={expenses || []}
    />
  )
}
