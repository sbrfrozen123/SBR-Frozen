import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import POSClient from './pos-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Pesanan Penjualan',
}

export default async function POSPage({
  searchParams,
}: {
  searchParams?: { edit?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Super Admin, Kasir, dan Sales boleh akses
  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir' && profile?.role !== 'sales') {
    redirect('/')
  }

  const branchId = await getBranchContext(supabase, user.id)

  // Fetch products (only active) and branch stocks via warehouses
  let query = supabase
    .from('products')
    .select(`
      id, sku, barcode, name, unit, category, 
      price_retail, price_grosir, price_horeca,
      product_stocks (
        stock_quantity, 
        min_stock_alert, 
        warehouse_id,
        warehouses!inner (branch_id)
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (branchId) {
    query = query.eq('product_stocks.warehouses.branch_id', branchId)
  }

  const { data: rawProducts } = await query

  const products = (rawProducts || []).map(p => {
    const stocks = p.product_stocks || []
    const totalQty = stocks.reduce((acc: number, s: any) => acc + (Number(s.stock_quantity) || 0), 0)
    return { ...p, stock_quantity: totalQty }
  })

  // Fetch customers (only active)
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, category, phone, credit_limit, payment_terms, current_debt')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch store settings for tax & receipts
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single()

  // Fetch branch details and its default warehouse
  let branch = null
  let defaultWarehouseId = null
  if (branchId) {
    const { data } = await supabase.from('branches').select('*').eq('id', branchId).single()
    branch = data
    
    const { data: wh } = await supabase.from('warehouses').select('id').eq('branch_id', branchId).limit(1).single()
    defaultWarehouseId = wh?.id || null
  }

  return (
    <POSClient 
      products={products} 
      customers={customers || []} 
      settings={settings}
      userRole={profile.role}
      userId={user.id}
      branchId={branchId}
      branch={branch}
      defaultWarehouseId={defaultWarehouseId}
      editTxId={searchParams?.edit}
    />
  )
}
