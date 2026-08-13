import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ReportsClient from './reports-client'

export const metadata: Metadata = {
  title: 'Pusat Laporan | SBR Frozen',
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hanya Super Admin yang boleh akses laporan
  if (profile?.role !== 'super_admin') {
    redirect('/')
  }

  // Calculate current month date boundaries
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  
  // Fetch Quick Summaries for Dashboard Cards
  
  // 1. Total Sales this month
  const { data: salesData } = await supabase
    .from('transactions')
    .select('total_amount')
    .gte('created_at', firstDay)
    
  const totalSales = (salesData || []).reduce((sum, t) => sum + Number(t.total_amount), 0)

  // 2. Total Expenses this month
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', firstDay)
    
  const totalExpenses = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0)

  // 3. Total Inventory Value (Current)
  const { data: productsData } = await supabase
    .from('products')
    .select('stock_quantity, hpp, min_stock')
    
  let totalInventoryValue = 0
  let lowStockCount = 0
  
  ;(productsData || []).forEach(p => {
    totalInventoryValue += (p.stock_quantity * p.hpp)
    if (p.stock_quantity <= p.min_stock) {
      lowStockCount++
    }
  })

  const summary = {
    totalSales,
    totalExpenses,
    totalInventoryValue,
    lowStockCount
  }

  return <ReportsClient summary={summary} />
}
