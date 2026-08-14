import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SalesClient from './sales-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Penjualan | SBR Frozen',
}

export default async function SalesReportPage() {
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

  // Fetch all sales
  let salesQuery = supabase
    .from('transactions')
    .select('id, total_amount, created_at')
    .order('created_at', { ascending: false })
  if (branchId) salesQuery = salesQuery.eq('branch_id', branchId)
  const { data: salesData } = await salesQuery

  // For Top Products (Current Month)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  
  let itemsQuery = supabase
    .from('transaction_items')
    .select('product_id, qty, transactions!inner(branch_id), products(name, sku)')
    .gte('created_at', firstDayOfMonth)
  if (branchId) itemsQuery = itemsQuery.eq('transactions.branch_id', branchId)
  
  const { data: itemsData } = await itemsQuery
  const items = itemsData || []

  // Aggregate in JS (since Supabase needs RPC for GROUP BY)
  const productTotals: Record<string, { product_id: string, total_qty: number, products: any }> = {}
  
  ;(items || []).forEach(item => {
    if (!productTotals[item.product_id]) {
      productTotals[item.product_id] = {
        product_id: item.product_id,
        total_qty: 0,
        products: item.products
      }
    }
    productTotals[item.product_id].total_qty += item.qty
  })

  const topProducts = Object.values(productTotals)
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 10) // Top 10

  return (
    <SalesClient 
      salesData={salesData || []} 
      topProducts={topProducts}
    />
  )
}
