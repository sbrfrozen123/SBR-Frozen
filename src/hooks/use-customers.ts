import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/database'

const supabase = createClient()

export function useCustomers(initialData?: Customer[]) {
  const fetcher = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, email, address, loyalty_points, credit_limit, current_debt, payment_terms, category, is_active, created_at, notes, updated_at')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as Customer[]
  }

  const { data, error, isLoading, mutate } = useSWR<Customer[]>('customers', fetcher, {
    revalidateOnFocus: false, // Don't constantly fetch when focusing window
    dedupingInterval: 60000, // 1 minute deduplication
    fallbackData: initialData
  })

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate
  }
}
