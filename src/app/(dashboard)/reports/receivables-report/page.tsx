import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ReceivablesClient from './receivables-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Piutang | SBR Frozen',
}

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  // Fetch customers with current_debt > 0
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, credit_limit, payment_terms, current_debt, is_active')
    .gt('current_debt', 0)
    .order('name')

  return (
    <ReceivablesClient 
      customers={customers || []}
    />
  )
}
