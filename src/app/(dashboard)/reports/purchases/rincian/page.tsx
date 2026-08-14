import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import PurchasesRincianClient from './rincian-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Rincian Pembelian Barang | SBR Frozen',
}

export default async function PurchasesRincianPage({
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

  if (!['super_admin', 'admin_gudang'].includes(profile?.role || '')) redirect('/')

  const userBranchId = await getBranchContext(supabase, user.id)

  const from = searchParams?.from as string
  const to = searchParams?.to as string
  const branch_id = searchParams?.branch as string
  const supplier_id = searchParams?.supplier as string

  // Fetch branches for filter
  const { data: branches } = await supabase.from('branches').select('id, name')

  // Fetch suppliers for filter
  const { data: suppliers } = await supabase.from('suppliers').select('id, name')

  // Only fetch data if from and to are provided
  let purchasesData: any[] = []
  
  if (from && to) {
    let purchasesQuery = supabase
      .from('purchases')
      .select(`
        *,
        suppliers ( name ),
        profiles ( full_name ),
        branches ( name ),
        purchase_items (
          id, qty, unit_price, subtotal,
          products ( name, unit )
        )
      `)
      .order('purchase_date', { ascending: false })

    if (branch_id && branch_id !== 'all') {
      purchasesQuery = purchasesQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      purchasesQuery = purchasesQuery.eq('branch_id', userBranchId)
    }

    if (supplier_id && supplier_id !== 'all') {
      purchasesQuery = purchasesQuery.eq('supplier_id', supplier_id)
    }

    purchasesQuery = purchasesQuery.gte('purchase_date', from)
    purchasesQuery = purchasesQuery.lte('purchase_date', to)

    const { data } = await purchasesQuery
    purchasesData = data || []
  }

  return (
    <PurchasesRincianClient 
      purchasesData={purchasesData} 
      branches={branches || []}
      suppliers={suppliers || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
      initialSupplier={supplier_id || ''}
    />
  )
}
