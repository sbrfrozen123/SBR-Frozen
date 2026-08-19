import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import WarehousesClient from './warehouses-client'

export const metadata: Metadata = {
  title: 'Manajemen Gudang',
}

export default async function WarehousesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  // Fetch branches
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('name')

  // Fetch warehouses
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select(`
      *,
      branches (id, name)
    `)
    .order('name', { ascending: true })

  return (
    <WarehousesClient 
      initialWarehouses={warehouses || []} 
      branches={branches || []}
    />
  )
}
