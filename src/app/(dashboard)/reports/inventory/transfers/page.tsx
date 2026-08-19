import { createClient } from '@/lib/supabase/server'
import TransfersClient from './transfers-client'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Histori Transfer Barang | SBR POS',
}

export default async function TransfersReportPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin_gudang'].includes(profile.role)) {
    redirect('/')
  }

  return <TransfersClient userRole={profile.role} />
}
