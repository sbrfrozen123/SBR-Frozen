import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import PurchasesClient from './purchases-client'

export const metadata: Metadata = {
  title: 'Pembelian & Restock',
}

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin dan Admin Gudang yang boleh akses menu Pembelian
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  // Fetch purchases with supplier and user names
  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      supplier:supplier_id(name),
      user:user_id(full_name)
    `)
    .order('created_at', { ascending: false })

  return <PurchasesClient initialPurchases={purchases || []} userRole={profile.role} />
}
