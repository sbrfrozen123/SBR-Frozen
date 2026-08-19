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

  // Super Admin, Kasir, dan Sales boleh akses menu Customer
  if (!['super_admin', 'kasir', 'sales'].includes(profile?.role || '')) {
    redirect('/')
  }

  // Fetch initial customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, email, address, loyalty_points, credit_limit, current_debt, payment_terms, category, is_active, created_at')
    .order('name', { ascending: true })

  return <CustomersClient initialCustomers={customers || []} userRole={profile!.role} />
}
