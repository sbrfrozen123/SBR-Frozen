import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import HutangClient from './hutang-client'

export const metadata: Metadata = {
  title: 'Hutang | SBR Frozen',
}

export default async function HutangPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  const { data: branches } = await supabase.from('branches').select('id, name')
  const { data: suppliers } = await supabase.from('suppliers').select('id, name, code')

  return (
    <HutangClient 
      branches={branches || []}
      suppliers={suppliers || []}
      userId={user.id}
    />
  )
}
