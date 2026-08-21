import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBranchContext } from '@/app/actions/branch'
import type { Metadata } from 'next'
import EditPurchaseClient from './edit-purchase-client'

export const metadata: Metadata = {
  title: 'Edit Faktur Pembelian',
}

export default async function EditPurchasePage({ params }: { params: { id: string } }) {
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

  // Fetch the purchase to edit
  const { data: purchase } = await supabase
    .from('purchases')
    .select(`
      *,
      purchase_items(
        id,
        product_id,
        qty,
        unit_price,
        subtotal,
        product:product_id(id, name, sku, unit, stock_quantity, hpp)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!purchase) redirect('/purchases')

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

  const branchId = await getBranchContext(supabase, user.id)

  let defaultWarehouseId = null
  if (branchId) {
    const { data: wh } = await supabase.from('warehouses').select('id').eq('branch_id', branchId).limit(1).single()
    defaultWarehouseId = wh?.id || null
  }

  return (
    <EditPurchaseClient 
      purchase={purchase}
      products={products || []} 
      suppliers={suppliers || []} 
      warehouses={warehouses || []}
      userId={user.id}
      branchId={branchId}
      defaultWarehouseId={defaultWarehouseId}
    />
  )
}
