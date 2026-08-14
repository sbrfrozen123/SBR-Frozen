import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ValueClient from './value-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Nilai Persediaan Barang | SBR Frozen',
}

export default async function InventoryValuePage({
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
  
  // The 'load' param tells us if the user has clicked "Tampilkan" (to show modal or not)
  const isLoaded = searchParams?.load === 'true'
  const branch_id = searchParams?.branch as string

  // Fetch branches for filter
  const { data: branches } = await supabase.from('branches').select('id, name')

  let productsData: any[] = []

  if (isLoaded) {
    let productsQuery = supabase
      .from('product_stocks')
      .select(`
        stock_quantity, 
        min_stock_alert, 
        branch_id, 
        branches(name), 
        products(id, name, sku, hpp, is_active, unit)
      `)

    if (branch_id && branch_id !== 'all') {
      productsQuery = productsQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      productsQuery = productsQuery.eq('branch_id', userBranchId)
    }

    const { data } = await productsQuery
    
    productsData = (data || [])
      .filter(ps => {
        const prod: any = Array.isArray(ps.products) ? ps.products[0] : ps.products
        return prod?.is_active !== false
      })
      .map(ps => {
        const prod: any = Array.isArray(ps.products) ? ps.products[0] : ps.products
        const branch: any = Array.isArray(ps.branches) ? ps.branches[0] : ps.branches
        return {
          id: prod?.id,
          name: prod?.name,
          sku: prod?.sku,
          hpp: prod?.hpp || 0,
          unit: prod?.unit || '-',
          stock_quantity: ps.stock_quantity,
          min_stock: ps.min_stock_alert,
          branch_name: branch?.name || '-'
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <ValueClient 
      products={productsData} 
      branches={branches || []}
      isLoaded={isLoaded}
      initialBranch={branch_id || ''}
    />
  )
}
