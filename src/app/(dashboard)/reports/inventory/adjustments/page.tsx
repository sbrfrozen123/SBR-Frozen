import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AdjustmentsClient from './adjustments-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Riwayat Penyesuaian Stok | SBR Frozen',
}

export default async function InventoryAdjustmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const userBranchId = await getBranchContext(supabase, user.id)
  
  const from = searchParams?.from as string
  const to = searchParams?.to as string
  const branch_id = searchParams?.branch as string

  // Fetch warehouses for filter
  const { data: warehouses } = await supabase.from('warehouses').select('id, name')

  let adjustmentsData: any[] = []

  if (from && to) {
    let adjustmentsQuery = supabase
      .from('stock_adjustments')
      .select(`
        id, type, qty_change, reason, created_at, 
        products(name, sku, unit), 
        profiles(full_name),
        warehouses(name)
      `)
      .order('created_at', { ascending: false })

    if (branch_id && branch_id !== 'all') {
      adjustmentsQuery = adjustmentsQuery.eq('warehouse_id', branch_id) // branch_id is now warehouse_id
    }
    
    // Use created_at for filtering dates
    adjustmentsQuery = adjustmentsQuery.gte('created_at', `${from}T00:00:00Z`)
    adjustmentsQuery = adjustmentsQuery.lte('created_at', `${to}T23:59:59Z`)

    const { data } = await adjustmentsQuery
    
    adjustmentsData = (data || []).map(adj => {
      const prod: any = Array.isArray(adj.products) ? adj.products[0] : adj.products
      const warehouse: any = Array.isArray(adj.warehouses) ? adj.warehouses[0] : adj.warehouses
      const user: any = Array.isArray(adj.profiles) ? adj.profiles[0] : adj.profiles
      
      return {
        id: adj.id,
        created_at: adj.created_at,
        type: adj.type,
        qty_change: adj.qty_change,
        reason: adj.reason,
        product_name: prod?.name || '-',
        product_sku: prod?.sku || '-',
        unit: prod?.unit || '-',
        branch_name: warehouse?.name || '-', // still map to branch_name prop for client component compatibility
        user_name: user?.full_name || 'Sistem'
      }
    })
  }

  return (
    <AdjustmentsClient 
      adjustments={adjustmentsData} 
      branches={warehouses || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
    />
  )
}
