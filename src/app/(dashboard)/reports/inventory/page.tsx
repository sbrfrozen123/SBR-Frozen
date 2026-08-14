import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import InventoryClient from './inventory-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Inventaris | SBR Frozen',
}

export default async function InventoryReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const branchId = await getBranchContext(supabase, user.id)

  let productsQuery = supabase.from('product_stocks').select('stock_quantity, min_stock_alert, branch_id, products(id, name, sku, hpp, is_active)')
  let adjustmentsQuery = supabase.from('stock_adjustments').select('id, type, qty_change, reason, created_at, products(name), profiles(full_name)').order('created_at', { ascending: false }).limit(100)

  if (branchId) {
    productsQuery = productsQuery.eq('branch_id', branchId)
    adjustmentsQuery = adjustmentsQuery.eq('branch_id', branchId)
  }

  const [
    { data: productStocksData },
    { data: adjustments }
  ] = await Promise.all([
    productsQuery,
    adjustmentsQuery
  ])

  // Transform product_stocks into expected shape
  const products = (productStocksData || [])
    .filter(ps => {
      const prod: any = Array.isArray(ps.products) ? ps.products[0] : ps.products
      return prod?.is_active !== false
    })
    .map(ps => {
      const prod: any = Array.isArray(ps.products) ? ps.products[0] : ps.products
      return {
        id: prod?.id,
        name: prod?.name,
        sku: prod?.sku,
        hpp: prod?.hpp,
        stock_quantity: ps.stock_quantity,
        min_stock: ps.min_stock_alert // map min_stock_alert to min_stock for the UI
      }
    })

  return (
    <InventoryClient 
      products={products}
      adjustments={adjustments || []}
    />
  )
}
