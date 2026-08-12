import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import POSClient from './pos-client'

export const metadata: Metadata = {
  title: 'POS Kasir',
}

export default async function POSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Super Admin dan Kasir boleh akses
  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir') {
    redirect('/')
  }

  // Fetch products (only active)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch customers (only active)
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, category, phone, credit_limit, current_debt')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch store settings for tax & receipts
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single()

  return (
    <POSClient 
      products={products || []} 
      customers={customers || []} 
      settings={settings}
      userRole={profile.role}
      userId={user.id}
    />
  )
}
