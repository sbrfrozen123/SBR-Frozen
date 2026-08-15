import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ExpensesClient from './expenses-client'

export const metadata: Metadata = {
  title: 'Manajemen Pengeluaran',
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single()

  // Super Admin dan Kasir boleh akses menu Pengeluaran
  if (!['super_admin', 'kasir'].includes(profile?.role || '')) {
    redirect('/')
  }

  // Fetch initial expenses (current month default)
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, profiles(full_name)')
    .gte('expense_date', firstDay)
    .order('expense_date', { ascending: false })

  return <ExpensesClient initialExpenses={expenses || []} userId={user.id} branchId={profile?.branch_id} />
}
