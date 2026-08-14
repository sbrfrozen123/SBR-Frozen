import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintClient from './print-client'

export default async function PrintShiftPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: shift } = await supabase
    .from('cashier_shifts')
    .select(`
      *,
      profiles:user_id(
        full_name,
        branches(name, address, phone)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!shift) notFound()

  // Get total cash sales
  const { data: txns } = await supabase
    .from('transactions')
    .select('amount_paid, payment_method, total_amount')
    .eq('user_id', shift.user_id)
    .gte('created_at', shift.start_time)
    .lte('created_at', shift.end_time || new Date().toISOString())

  // Get store settings
  const { data: settings } = await supabase.from('store_settings').select('*').maybeSingle()

  const cashSales = (txns || []).filter(t => t.payment_method === 'tunai').reduce((sum, t) => sum + (t.amount_paid || 0), 0)
  const nonCashSales = (txns || []).filter(t => t.payment_method !== 'tunai').reduce((sum, t) => sum + (t.total_amount || 0), 0)

  return (
    <PrintClient 
      shift={shift} 
      settings={settings} 
      cashSales={cashSales}
      nonCashSales={nonCashSales}
    />
  )
}
