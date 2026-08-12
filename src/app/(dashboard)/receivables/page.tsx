import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ReceivablesClient from './receivables-client'

export const metadata: Metadata = {
  title: 'Buku Piutang Pelanggan',
}

export default async function ReceivablesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Kasir yang boleh akses menu Piutang
  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir') {
    redirect('/')
  }

  // Fetch pending receivables (transactions with payment_status = 'piutang')
  // We join with customers to get their names and current debts
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      customers (
        id,
        name,
        phone,
        current_debt,
        credit_limit
      )
    `)
    .eq('payment_status', 'piutang')
    .order('created_at', { ascending: false })

  return <ReceivablesClient initialTransactions={transactions || []} userId={user.id} />
}
