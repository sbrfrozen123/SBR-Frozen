import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ShiftsMediaClient from './shifts-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Rincian Shift Kerja | SBR Frozen',
}

export default async function ShiftsMediaPage({
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

  // Fetch branches for filter
  const { data: branches } = await supabase.from('branches').select('id, name')

  let shifts: any[] = []

  if (from && to) {
    let shiftsQuery = supabase
      .from('cashier_shifts')
      .select('id, start_time, end_time, starting_cash, actual_cash, expected_cash, difference, status, branch_id, profiles!cashier_shifts_user_id_fkey(full_name)')

    if (branch_id && branch_id !== 'all') {
      shiftsQuery = shiftsQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      shiftsQuery = shiftsQuery.eq('branch_id', userBranchId)
    }

    shiftsQuery = shiftsQuery.gte('start_time', `${from}T00:00:00Z`).lte('start_time', `${to}T23:59:59Z`).order('start_time', { ascending: false })

    const { data: shiftsData } = await shiftsQuery
    shifts = shiftsData || []
  }

  return (
    <ShiftsMediaClient 
      shifts={shifts}
      branches={branches || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
    />
  )
}
