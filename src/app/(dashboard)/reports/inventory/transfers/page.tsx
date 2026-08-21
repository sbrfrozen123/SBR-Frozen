import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TransfersReportClient from './transfers-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Transfer Barang | SBR Frozen',
}

export default async function TransfersReportPage({ searchParams }: { searchParams: { from?: string, to?: string, branch?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!['super_admin', 'admin_gudang', 'direktur'].includes(profile?.role || '')) {
    redirect('/')
  }

  const branchId = await getBranchContext(supabase, user.id)

  const { from, to, branch } = searchParams
  
  const filterFrom = from || ''
  const filterTo = to || ''
  const filterBranch = branch || 'all'

  const { data: branches } = await supabase.from('branches').select('id, name').order('name')

  let query = supabase.from('stock_transfers')
    .select(`
      *,
      from_wh:warehouses!from_warehouse_id(name),
      to_wh:warehouses!to_warehouse_id(name),
      creator:profiles!stock_transfers_user_id_fkey(full_name),
      receiver:profiles!stock_transfers_received_by_fkey(full_name),
      items:stock_transfer_items(
        *,
        products(name, sku, unit)
      )
    `)
    .order('transfer_date', { ascending: false })

  if (filterFrom && filterTo) {
    query = query.gte('transfer_date', filterFrom + 'T00:00:00')
                 .lte('transfer_date', filterTo + 'T23:59:59')
                 
    if (filterBranch !== 'all') {
      const { data: whData } = await supabase.from('warehouses').select('id').eq('branch_id', filterBranch)
      if (whData && whData.length > 0) {
        const whIds = whData.map(w => w.id)
        query = query.or(`from_warehouse_id.in.(${whIds.join(',')}),to_warehouse_id.in.(${whIds.join(',')})`)
      } else {
        // Force empty if no warehouses match
        query = query.eq('id', '00000000-0000-0000-0000-000000000000') 
      }
    }
  } else {
    // If no filter, don't return data initially, or just limit 0
    query = query.limit(0)
  }

  const { data: transfers } = await query

  return (
    <TransfersReportClient 
      initialTransfers={transfers || []}
      branches={branches || []}
      initialFrom={filterFrom}
      initialTo={filterTo}
      initialBranch={filterBranch}
    />
  )
}
