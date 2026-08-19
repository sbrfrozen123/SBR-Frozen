import { createClient } from '@/lib/supabase/server'
import ShiftSalesClient from './shift-sales-client'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Laporan Penjualan per Shift | SBR POS',
}

export default async function ShiftSalesReportPage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin'].includes(profile.role)) {
    redirect('/')
  }

  return <ShiftSalesClient userRole={profile.role} />
}
