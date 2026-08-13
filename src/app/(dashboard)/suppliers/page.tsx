import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SuppliersClient from './suppliers-client'

export const metadata: Metadata = {
  title: 'Data Pemasok (Suppliers)',
}

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Admin Gudang yang boleh akses menu Pemasok
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  // Fetch initial suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true })

  return <SuppliersClient initialSuppliers={suppliers || []} userRole={profile.role} />
}
