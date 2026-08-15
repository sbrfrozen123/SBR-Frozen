import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CustomersMediaClient from './customers-client'

export const metadata: Metadata = {
  title: 'Daftar Customer | SBR Frozen',
}

export default async function CustomersMediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, address, category, is_active')
    .order('name')

  return (
    <CustomersMediaClient 
      customers={customers || []}
    />
  )
}
