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

  // Super Admin, Admin Gudang, dan Sales boleh akses Inventaris
  if (!['super_admin', 'admin_gudang', 'sales'].includes(profile?.role || '')) {
    redirect('/')
  }

  const branchId = await getBranchContext(supabase, user.id)

  // Pass empty array for Client-Side Rendering to handle
  const products: any[] = []

  let defaultWarehouseId = null
  let warehouses = []
  if (branchId) {
    const { data: wh } = await supabase.from('warehouses').select('*').eq('branch_id', branchId)
    warehouses = wh || []
    defaultWarehouseId = warehouses[0]?.id || null
  } else {
    const { data: wh } = await supabase.from('warehouses').select('*, branches(name)')
    warehouses = wh || []
  }

  return <InventoryClient initialProducts={products} userRole={profile!.role} branchId={branchId} defaultWarehouseId={defaultWarehouseId} warehouses={warehouses} />
}
