import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintClient from './print-client'

export default async function PrintInvoicePage({ params, searchParams }: { params: { id: string }, searchParams: { format?: string } }) {
  const supabase = await createClient()
  const { data: txn } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles(full_name),
      customers(name, phone, address),
      branches(name, address, phone),
      transaction_items(*, product:products(name, sku, unit))
    `)
    .eq('id', params.id)
    .single()

  if (!txn) notFound()

  // Get store settings (for store name, address, etc.) if exists
  const { data: settings } = await supabase.from('store_settings').select('*').maybeSingle()

  return <PrintClient transaction={txn} settings={settings} format={searchParams.format || 'a4'} />
}
