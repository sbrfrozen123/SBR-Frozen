import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Get start and end of current month
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // 1. Fetch Transactions (Current Month)
  const { data: txns } = await supabase
    .from('transactions')
    .select('created_at, total_amount, amount_paid')
    .gte('created_at', firstDay)
    .lte('created_at', lastDay)
    
  // 2. Fetch Expenses (Current Month)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', firstDay)
    .lte('expense_date', lastDay)

  // 3. Fetch Transaction Items (Current Month) for COGS (HPP) and Top Products
  const { data: txnItems } = await supabase
    .from('transaction_items')
    .select('qty, unit_price, hpp_snapshot, product_name, transactions!inner(created_at)')
    .gte('transactions.created_at', firstDay)
    .lte('transactions.created_at', lastDay)

  // 4. Fetch low stock products
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock_quantity, min_stock_alert')
    .lte('stock_quantity', 10) // rough filter, will refine in JS
    .order('stock_quantity', { ascending: true })

  const actualLowStock = (lowStock || []).filter(p => p.stock_quantity <= p.min_stock_alert)

  // --- AGGREGATIONS ---
  
  // Total Revenue (Omset)
  const totalOmset = (txns || []).reduce((sum, t) => sum + t.total_amount, 0)
  const piutangBerjalan = (txns || []).reduce((sum, t) => sum + (t.total_amount - t.amount_paid), 0)
  
  // Total COGS (HPP)
  const totalHPP = (txnItems || []).reduce((sum, item) => sum + (item.qty * (item.hpp_snapshot || 0)), 0)
  const grossProfit = totalOmset - totalHPP

  // Total Expenses
  const totalPengeluaran = (expenses || []).reduce((sum, e) => sum + e.amount, 0)
  
  // Net Profit
  const netProfit = grossProfit - totalPengeluaran

  // Daily Revenue Chart Data (Group by Day)
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return { name: `${day}`, omset: 0, profit: 0 }
  })

  // Populate Chart Data
  txns?.forEach(t => {
    const day = new Date(t.created_at).getDate()
    chartData[day - 1].omset += t.total_amount
  })
  
  // To get profit per day, we need HPP per day
  txnItems?.forEach(item => {
    const day = new Date((item.transactions as any).created_at).getDate()
    const itemRev = item.qty * item.unit_price
    const itemHPP = item.qty * (item.hpp_snapshot || 0)
    chartData[day - 1].profit += (itemRev - itemHPP) // Daily gross profit
  })

  // Top Products
  const productSales: Record<string, { qty: number, rev: number }> = {}
  txnItems?.forEach(item => {
    if (!productSales[item.product_name]) {
      productSales[item.product_name] = { qty: 0, rev: 0 }
    }
    productSales[item.product_name].qty += item.qty
    productSales[item.product_name].rev += (item.qty * item.unit_price)
  })

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5)

  return (
    <DashboardClient 
      userName={profile?.full_name || 'Admin'}
      role={profile?.role || 'kasir'}
      stats={{
        omset: totalOmset,
        grossProfit: grossProfit,
        netProfit: netProfit,
        expenses: totalPengeluaran,
        piutang: piutangBerjalan
      }}
      chartData={chartData}
      topProducts={topProducts}
      lowStockProducts={actualLowStock}
      monthName={date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
    />
  )
}
