import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Warehouse = Database['public']['Tables']['warehouses']['Row']

const supabase = createClient()

export function useWarehouses(initialData?: Warehouse[]) {
  const fetcher = async () => {
    const { data, error } = await supabase
      .from('warehouses')
      .select('id, branch_id, name, address, is_active, created_at, updated_at, branches(id, name)')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as Warehouse[]
  }

  const { data, error, isLoading, mutate } = useSWR<Warehouse[]>('warehouses', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    fallbackData: initialData
  })

  return {
    warehouses: data || [],
    isLoading,
    isError: error,
    mutate
  }
}
