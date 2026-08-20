import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import HutangClient from './hutang-client'

export const metadata: Metadata = {
  title: 'Laporan Hutang | SBR Frozen',
}

export default async function HutangPage({
  searchParams
}: {
  searchParams: { from?: string, to?: string, branch?: string, supplier?: string }
}) {
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

  // Get branches and suppliers for filters
  const { data: branches } = await supabase.from('branches').select('id, name')
  const { data: suppliers } = await supabase.from('suppliers').select('id, name, code')

  let query = supabase
    .from('purchases')
    .select(`
      *,
      supplier:supplier_id(name, code),
      branch:branch_id(name),
      user:user_id(full_name),
      payments:supplier_payments(*)
    `)
    .eq('payment_status', 'tempo')

  if (searchParams.from && searchParams.to) {
    query = query
      .gte('purchase_date', searchParams.from)
      .lte('purchase_date', searchParams.to)
  }
  
  if (searchParams.branch && searchParams.branch !== 'all') {
    query = query.eq('branch_id', searchParams.branch)
  }
  
  if (searchParams.supplier && searchParams.supplier !== 'all') {
    query = query.eq('supplier_id', searchParams.supplier)
  }

  const { data: purchases } = await query.order('purchase_date', { ascending: false })

  return (
    <HutangClient 
      purchasesData={purchases || []}
      branches={branches || []}
      suppliers={suppliers || []}
      initialFrom={searchParams.from || ''}
      initialTo={searchParams.to || ''}
      initialBranch={searchParams.branch || 'all'}
      initialSupplier={searchParams.supplier || 'all'}
    />
  )
}
