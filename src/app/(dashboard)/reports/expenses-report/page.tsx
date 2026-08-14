import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ExpensesReportClient from './expenses-report-client'
import { getBranchContext } from '@/app/actions/branch'

export const metadata: Metadata = {
  title: 'Laporan Pengeluaran | SBR Frozen',
}

export default async function ExpensesReportPage({
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

  let expenses: any[] = []

  if (from && to) {
    let expensesQuery = supabase
      .from('expenses')
      .select('id, expense_date, category, amount, description, profiles(full_name), branches(name)')
      .order('expense_date', { ascending: false })

    if (branch_id && branch_id !== 'all') {
      expensesQuery = expensesQuery.eq('branch_id', branch_id)
    } else if (userBranchId && !branch_id) {
      expensesQuery = expensesQuery.eq('branch_id', userBranchId)
    }

    expensesQuery = expensesQuery.gte('expense_date', from).lte('expense_date', to)

    const { data } = await expensesQuery
    
    expenses = (data || []).map(exp => {
      const branch: any = Array.isArray(exp.branches) ? exp.branches[0] : exp.branches
      const user: any = Array.isArray(exp.profiles) ? exp.profiles[0] : exp.profiles
      
      return {
        id: exp.id,
        expense_date: exp.expense_date,
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        branch_name: branch?.name || '-',
        user_name: user?.full_name || 'Sistem'
      }
    })
  }

  return (
    <ExpensesReportClient 
      expenses={expenses}
      branches={branches || []}
      initialFrom={from || ''}
      initialTo={to || ''}
      initialBranch={branch_id || ''}
    />
  )
}
