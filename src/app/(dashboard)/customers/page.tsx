import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CustomersClient from './customers-client'

export const metadata: Metadata = {
  title: 'Database Customer',
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Kasir yang boleh akses menu Customer
  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir') {
    redirect('/')
  }

  // Fetch initial customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  return <CustomersClient initialCustomers={customers || []} userRole={profile.role} />
}
