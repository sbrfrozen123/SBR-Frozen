import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ShiftsClient from './shifts-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Riwayat Shift Kasir',
}

export default async function ShiftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'kasir') {
    redirect('/')
  }

  // Super Admin can see all shifts. Kasir can only see their own shifts.
  let query = supabase
    .from('cashier_shifts')
    .select(`
      *,
      user:user_id(full_name)
    `)
    .order('start_time', { ascending: false })

  const branchId = await getBranchContext(supabase, user.id)
  
  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  if (profile.role === 'kasir') {
    query = query.eq('user_id', user.id)
  }

  const { data: shifts } = await query

  return <ShiftsClient initialShifts={shifts || []} userRole={profile.role} />
}
