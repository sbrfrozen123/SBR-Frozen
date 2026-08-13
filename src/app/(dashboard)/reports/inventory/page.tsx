import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import InventoryClient from './inventory-client'

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

  const [
    { data: products },
    { data: adjustments }
  ] = await Promise.all([
    supabase.from('products').select('id, name, sku, stock_quantity, min_stock, hpp'),
    supabase.from('stock_adjustments').select('id, type, qty_change, reason, created_at, products(name), profiles(full_name)').order('created_at', { ascending: false }).limit(100)
  ])

  return (
    <InventoryClient 
      products={products || []}
      adjustments={adjustments || []}
    />
  )
}
