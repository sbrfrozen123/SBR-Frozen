import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import EmployeesMediaClient from './employees-client'

export const metadata: Metadata = {
  title: 'Daftar Karyawan/Team | SBR Frozen',
}

export default async function EmployeesMediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, is_active, branch_id, branches(name)')
    .order('full_name')

  return (
    <EmployeesMediaClient 
      employees={employees || []}
    />
  )
}
