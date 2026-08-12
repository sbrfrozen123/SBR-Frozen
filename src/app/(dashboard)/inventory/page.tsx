import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import InventoryClient from './inventory-client'

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

  // Fetch initial products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  return <InventoryClient initialProducts={products || []} userRole={profile.role} />
}
