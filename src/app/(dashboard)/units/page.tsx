import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import UnitsClient from './units-client'

export const metadata: Metadata = {
  title: 'Satuan Barang',
}

export default async function UnitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Admin Gudang yang boleh akses menu Satuan
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  // Fetch initial units
  const { data: units } = await supabase
    .from('units')
    .select('*')
    .order('name', { ascending: true })

  return <UnitsClient initialUnits={units || []} userRole={profile.role} />
}
