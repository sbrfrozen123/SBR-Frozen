import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import RincianClient from './rincian-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Rincian Faktur Penjualan | SBR Frozen',
}

export default async function RincianFakturPage({
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

  const userBranchId = await getBranchContext(supabase, user.id)

  const from = searchParams?.from as string
  const to = searchParams?.to as string
  const branch_id = searchParams?.branch as string
  const salesman_id = searchParams?.salesman as string

  // Fetch branches for filter
  const { data: branches } = await supabase.from('branches').select('id, name')

  // Fetch salesmen for filter (users with kasir role, or just all profiles)
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('role', ['kasir', 'super_admin'])

  // Only fetch data if from and to are provided
  let salesData: any[] = []
  
  if (from && to) {
    let salesQuery = supabase
      .from('transactions')
      .select(`
        *,
        customers ( name ),
        profiles ( full_name ),
        branches ( name ),
        transaction_items (
          id, qty, unit, unit_price, discount_amount, subtotal, product_name, product_sku,
          products ( name, sku )
        )
      `)
      .order('created_at', { ascending: false })

    // If user is not super_admin, force their branch. But since this is a report, it's already gated to super_admin.
    // If branch_id is provided in filter, use it. Otherwise, if user has context branch, use that (unless they selected 'all').
    if (branch_id && branch_id !== 'all') {
      salesQuery = salesQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
       // if they haven't explicitly set a filter, use their branch context
      salesQuery = salesQuery.eq('branch_id', userBranchId)
    }

    if (salesman_id && salesman_id !== 'all') {
      salesQuery = salesQuery.eq('user_id', salesman_id)
    }

    salesQuery = salesQuery.gte('created_at', from)
    
    // Add 1 day to 'to' to include the whole day (up to 23:59:59)
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    salesQuery = salesQuery.lt('created_at', toDate.toISOString().split('T')[0])

    const { data } = await salesQuery
    salesData = data || []
  }

  return (
    <RincianClient 
      salesData={salesData} 
      branches={branches || []}
      profiles={profiles || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
      initialSalesman={salesman_id || ''}
    />
  )
}
