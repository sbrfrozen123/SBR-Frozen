import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TransfersClient from './transfers-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Transfer Stok | SBR Frozen',
}

export default async function TransfersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!['super_admin', 'admin_gudang'].includes(profile?.role || '')) {
    redirect('/')
  }

  const branchId = await getBranchContext(supabase, user.id)

  const { data: warehouses } = await supabase.from('warehouses').select('*, branches(name)')
  const { data: products } = await supabase.from('products').select('*, product_stocks(warehouse_id, stock_quantity)')
  
  const { data: transfers } = await supabase.from('stock_transfers')
    .select(`
      *,
      from_wh:from_warehouse_id(name),
      to_wh:to_warehouse_id(name),
      creator:user_id(full_name),
      receiver:received_by(full_name),
      items:stock_transfer_items(
        *,
        products(name, sku)
      )
    `)
    .order('transfer_date', { ascending: false })

  return <TransfersClient 
    userId={user.id}
    userRole={profile!.role}
    userName={profile!.full_name}
    branchId={branchId}
    warehouses={warehouses || []}
    products={products || []}
    initialTransfers={transfers || []}
  />
}
