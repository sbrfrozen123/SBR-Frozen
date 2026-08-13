import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ProfitLossClient from './profit-loss-client'

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
  const [
    { data: transactions },
    { data: transactionItems },
    { data: expenses }
  ] = await Promise.all([
    supabase.from('transactions').select('id, total_amount, created_at'),
    supabase.from('transaction_items').select('id, qty, created_at, products(hpp)'),
    supabase.from('expenses').select('id, amount, expense_date')
  ])

  return (
    <ProfitLossClient 
      transactions={transactions || []}
      transactionItems={transactionItems || []}
      expenses={expenses || []}
    />
  )
}
