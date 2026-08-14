import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ExpensesReportClient from './expenses-report-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Pengeluaran | SBR Frozen',
}

export default async function ExpensesReportPage() {
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

  // Fetch expenses with user info
  let expensesQuery = supabase
    .from('expenses')
    .select('id, expense_date, category, amount, description, profiles(full_name)')
    .order('expense_date', { ascending: false })

  if (branchId) {
    expensesQuery = expensesQuery.eq('branch_id', branchId)
  }

  const { data: expenses } = await expensesQuery

  return (
    <ExpensesReportClient expenses={expenses || []} />
  )
}
