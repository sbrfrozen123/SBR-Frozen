import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SettingsClient from './settings-client'

export const metadata: Metadata = {
  title: 'Pengaturan | SBR Frozen',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin yang boleh masuk pengaturan utama
  if (profile?.role !== 'super_admin') {
    redirect('/')
  }

  // Fetch store settings
  const { data: storeSettings } = await supabase
    .from('store_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Fetch all users for user management
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')
    .order('created_at', { ascending: true })

  return (
    <SettingsClient 
      initialStoreSettings={storeSettings} 
      initialUsers={users || []} 
    />
  )
}
