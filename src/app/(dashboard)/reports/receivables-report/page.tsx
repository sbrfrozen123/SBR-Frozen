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
  const { data: customersData } = await supabase
    .from('customers')
    .select('id, name, phone, credit_limit, payment_terms, current_debt, is_active')
    .gt('current_debt', 0)
    .order('name')

  const customerIds = customersData?.map(c => c.id) || []
  let enrichedCustomers = customersData || []

  if (customerIds.length > 0) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('customer_id, total_amount, amount_paid')
      .in('customer_id', customerIds)
      .eq('payment_status', 'piutang')

    enrichedCustomers = enrichedCustomers.map(c => {
      const customerTxns = transactions?.filter(t => t.customer_id === c.id) || []
      const total_transaction = customerTxns.reduce((sum, t) => sum + (t.total_amount || 0), 0)
      const total_paid = customerTxns.reduce((sum, t) => sum + (t.amount_paid || 0), 0)
      return {
        ...c,
        total_transaction,
        total_paid
      }
    })
  }

  return (
    <ReceivablesClient 
      customers={enrichedCustomers || []}
    />
  )
}
