import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ExpensesReportClient from './expenses-report-client'

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

  // Fetch expenses with user info
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, expense_date, category, amount, description, profiles(full_name)')
    .order('expense_date', { ascending: false })

  return (
    <ExpensesReportClient expenses={expenses || []} />
  )
}
