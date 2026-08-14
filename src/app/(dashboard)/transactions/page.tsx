import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TransactionHistoryClient from './transactions-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Pesanan & Transaksi | SBR Frozen',
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

  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir') redirect('/')

  const branchId = await getBranchContext(supabase, user.id)

  let query = supabase
    .from('transactions')
    .select(`
      *,
      profiles(full_name),
      customers(name, phone),
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

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data: transactions } = await query

  const { data: settingsData } = await supabase.from('settings').select('*').single()

  return (
    <TransactionHistoryClient 
      transactions={transactions || []} 
      userRole={profile.role} 
      branchId={branchId}
      settings={settingsData}
    />
  )
}
