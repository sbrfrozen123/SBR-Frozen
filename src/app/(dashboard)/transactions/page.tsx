import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TransactionHistoryClient from './transactions-client'

export const metadata: Metadata = {
  title: 'Riwayat Transaksi | SBR Frozen',
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles(full_name),
      transaction_items(
        id,
        product_id,
        product_name,
        qty,
        unit,
        unit_price,
        subtotal
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return <TransactionHistoryClient transactions={transactions || []} />
}
