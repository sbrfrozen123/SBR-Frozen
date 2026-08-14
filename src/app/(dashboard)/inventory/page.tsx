import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import InventoryClient from './inventory-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Database Stok & Inventaris',
}

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Admin Gudang yang boleh akses menu Inventaris penuh
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  const branchId = await getBranchContext(supabase, user.id)

  // Fetch initial products with their stocks
  let query = supabase
    .from('products')
    .select(`
      *,
      product_stocks (
        stock_quantity,
        min_stock_alert,
        branch_id
      )
    `)
    .order('name', { ascending: true })
    
  if (branchId) {
    query = query.eq('product_stocks.branch_id', branchId)
  }

  const { data: rawProducts } = await query

  // Aggregate stock
  const products = (rawProducts || []).map(p => {
    const stocks = p.product_stocks || []
    const totalQty = stocks.reduce((acc: number, s: any) => acc + (Number(s.stock_quantity) || 0), 0)
    // For min_alert, if specific branch, use it. Else use product global or first branch's.
    const minAlert = stocks.length === 1 ? stocks[0].min_stock_alert : p.min_stock_alert

    return {
      ...p,
      stock_quantity: totalQty,
      min_stock_alert: minAlert
    }
  })

  return <InventoryClient initialProducts={products} userRole={profile.role} branchId={branchId} />
}
