import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SalesClient from './sales-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Penjualan | SBR Frozen',
}

export default async function SalesReportPage({
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

  const branchId = await getBranchContext(supabase, user.id)

  // Default dates if not provided: This month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDayOfMonthStr = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const from = (searchParams?.from as string) || firstDayOfMonth
  const to = (searchParams?.to as string) || lastDayOfMonthStr
  const tab = (searchParams?.tab as string) || 'ringkasan'

  // Fetch detailed sales
  let salesQuery = supabase
    .from('transactions')
    .select(`
      *,
      customers ( name ),
      profiles ( full_name ),
      branches ( name ),
      transaction_items (
        id, qty, unit, unit_price, subtotal, product_name, product_sku,
        products ( name, sku )
      )
    `)
    .order('created_at', { ascending: false })

  if (branchId) salesQuery = salesQuery.eq('branch_id', branchId)
  
  // Date filtering
  if (from) salesQuery = salesQuery.gte('created_at', from)
  if (to) {
    // Add 1 day to 'to' to include the whole day (up to 23:59:59)
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    salesQuery = salesQuery.lt('created_at', toDate.toISOString().split('T')[0])
  }

  const { data: salesData } = await salesQuery

  return (
    <SalesClient 
      salesData={salesData || []} 
      initialFrom={from}
      initialTo={to}
      initialTab={tab}
    />
  )
}
