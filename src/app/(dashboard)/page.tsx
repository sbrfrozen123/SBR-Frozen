import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/pos')

  // Fetch dashboard summary data (server-side for initial load)
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    { data: todayTxns },
    { data: activeReceivables },
    { data: monthlyExpenses },
    { data: lowStockProducts },
    { data: recentTransactions },
    { data: weekSales },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_amount, payment_status')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
      .eq('transaction_type', 'sale'),
    supabase
      .from('transactions')
      .select('total_amount, amount_paid, due_date')
      .eq('payment_status', 'piutang'),
    supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', monthStart.split('T')[0]),
    supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_alert, sku')
      .lte('stock_quantity', supabase.rpc as unknown as never)
      .filter('stock_quantity', 'lte', supabase
        .from('products')
        .select('min_stock_alert') as unknown as string)
      .eq('is_active', true)
      .limit(10),
    supabase
      .from('transactions')
      .select('id, invoice_number, total_amount, payment_method, payment_status, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .rpc('get_week_sales'),
  ])

  // Simple calculations
  const todayRevenue = (todayTxns || [])
    .filter(t => t.payment_status === 'lunas')
    .reduce((sum, t) => sum + t.total_amount, 0)

  const totalReceivables = (activeReceivables || [])
    .reduce((sum, t) => sum + (t.total_amount - t.amount_paid), 0)

  const totalMonthlyExpenses = (monthlyExpenses || [])
    .reduce((sum, e) => sum + e.amount, 0)

  // Get low stock separately
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, sku, stock_quantity, min_stock_alert, unit')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(5)

  const actualLowStock = (lowStock || []).filter(p => p.stock_quantity <= p.min_stock_alert)

  // Get overdue receivables
  const overdueReceivables = (activeReceivables || []).filter(t => {
    if (!t.due_date) return false
    return new Date(t.due_date) < today
  })

  return (
    <DashboardClient
      todayRevenue={todayRevenue}
      totalReceivables={totalReceivables}
      totalMonthlyExpenses={totalMonthlyExpenses}
      lowStockProducts={actualLowStock}
      overdueReceivablesCount={overdueReceivables.length}
      recentTransactions={recentTransactions || []}
    />
  )
}
