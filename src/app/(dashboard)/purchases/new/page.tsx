import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import NewPurchaseClient from './new-purchase-client'

export const metadata: Metadata = {
  title: 'Transaksi Pembelian (Restock)',
}

export default async function NewPurchasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch active suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('*')
    .order('name', { ascending: true })

  const branchId = profile?.branch_id || null

  let defaultWarehouseId = null
  if (branchId) {
    const { data: wh } = await supabase.from('warehouses').select('id').eq('branch_id', branchId).limit(1).single()
    defaultWarehouseId = wh?.id || null
  }

  return (
    <NewPurchaseClient 
      products={products || []} 
      suppliers={suppliers || []} 
      warehouses={warehouses || []}
      userId={user.id}
      branchId={branchId}
      defaultWarehouseId={defaultWarehouseId}
    />
  )
}
