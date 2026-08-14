import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import { getBranchContext } from '@/app/actions/branch'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
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

  const filter = searchParams.filter || 'this_month'
  const date = new Date()
  let firstDay: string, lastDay: string
  let filterName = 'Bulan Ini'

  if (filter === 'today') {
    firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).toISOString()
    lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
    filterName = 'Hari Ini'
  } else if (filter === 'this_week') {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    firstDay = new Date(date.getFullYear(), date.getMonth(), diff, 0, 0, 0).toISOString()
    lastDay = new Date(date.getFullYear(), date.getMonth(), diff + 6, 23, 59, 59).toISOString()
    filterName = 'Minggu Ini'
  } else if (filter === 'last_month') {
    firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString()
    lastDay = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59).toISOString()
    filterName = 'Bulan Lalu'
  } else { // this_month
    firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
  }

  const branchId = await getBranchContext(supabase, user.id)

  // 1. Fetch Transactions (Current Month)
  let txnsQuery = supabase
    .from('transactions')
    .select('created_at, total_amount, amount_paid, user_id, profiles(role), customer_id, customers(name)')
    .gte('created_at', firstDay)
    .lte('created_at', lastDay)
  if (branchId) txnsQuery = txnsQuery.eq('branch_id', branchId)
  const { data: txns } = await txnsQuery
    
  // 2. Fetch Expenses (Current Month)
  let expensesQuery = supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', firstDay)
    .lte('expense_date', lastDay)
  if (branchId) expensesQuery = expensesQuery.eq('branch_id', branchId)
  const { data: expenses } = await expensesQuery

  // 3. Fetch Transaction Items (Current Month) for COGS (HPP) and Top Products
  let txnItemsQuery = supabase
    .from('transaction_items')
    .select('qty, unit_price, hpp_snapshot, product_name, products(category), transactions!inner(created_at, branch_id)')
    .gte('transactions.created_at', firstDay)
    .lte('transactions.created_at', lastDay)
  if (branchId) txnItemsQuery = txnItemsQuery.eq('transactions.branch_id', branchId)
  const { data: txnItems } = await txnItemsQuery

  // 3.5 Fetch Historical Transactions for 6 Month Trend
  const sixMonthsAgoObj = new Date()
  sixMonthsAgoObj.setMonth(sixMonthsAgoObj.getMonth() - 5)
  sixMonthsAgoObj.setDate(1)
  sixMonthsAgoObj.setHours(0,0,0,0)
  const sixMonthsAgo = sixMonthsAgoObj.toISOString()

  let monthlyTxnsQuery = supabase
    .from('transactions')
    .select('created_at, total_amount')
    .gte('created_at', sixMonthsAgo)
  if (branchId) monthlyTxnsQuery = monthlyTxnsQuery.eq('branch_id', branchId)
  const { data: monthlyTxns } = await monthlyTxnsQuery

  // 4. Fetch low stock products (based on product_stocks)
  let lowStockQuery = supabase
    .from('product_stocks')
    .select('stock_quantity, min_stock_alert, branch_id, products(id, name, is_active)')
  if (branchId) lowStockQuery = lowStockQuery.eq('branch_id', branchId)
  const { data: lowStockData } = await lowStockQuery

  const actualLowStock = (lowStockData || [])
    .map(ps => {
      const prod: any = Array.isArray(ps.products) ? ps.products[0] : ps.products
      return {
        id: prod?.id,
        name: prod?.name,
        is_active: prod?.is_active,
        stock_quantity: ps.stock_quantity,
        min_stock_alert: ps.min_stock_alert
      }
    })
    .filter(ps => ps.is_active && ps.stock_quantity <= ps.min_stock_alert)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)

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

  // Chart Data Grouping
  let chartData: any[] = []
  
  if (filter === 'today') {
    // Group by hours (0-23)
    chartData = Array.from({ length: 24 }, (_, i) => ({ name: `${i.toString().padStart(2, '0')}:00`, omset: 0, profit: 0 }))
    txns?.forEach(t => {
      const hour = new Date(t.created_at).getHours()
      chartData[hour].omset += t.total_amount
    })
    txnItems?.forEach(item => {
      const hour = new Date((item.transactions as any).created_at).getHours()
      const itemRev = item.qty * item.unit_price
      const itemHPP = item.qty * (item.hpp_snapshot || 0)
      chartData[hour].profit += (itemRev - itemHPP)
    })
  } else {
    // Group by days
    const startObj = new Date(firstDay)
    const endObj = new Date(lastDay)
    const days = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24))
    
    chartData = Array.from({ length: days }, (_, i) => {
      const d = new Date(startObj.getTime() + (i * 1000 * 3600 * 24))
      return { 
        name: filter === 'this_week' ? d.toLocaleDateString('id-ID', { weekday: 'short' }) : `${d.getDate()}`, 
        omset: 0, 
        profit: 0,
        day: d.getDate()
      }
    })

    txns?.forEach(t => {
      const tDate = new Date(t.created_at)
      if (filter === 'this_week') {
        const dayIdx = (tDate.getDay() + 6) % 7 // Mon = 0, Sun = 6
        if (chartData[dayIdx]) chartData[dayIdx].omset += t.total_amount
      } else {
        const d = tDate.getDate()
        const idx = chartData.findIndex(c => c.day === d)
        if (idx !== -1) chartData[idx].omset += t.total_amount
      }
    })
    
    txnItems?.forEach(item => {
      const tDate = new Date((item.transactions as any).created_at)
      const itemRev = item.qty * item.unit_price
      const itemHPP = item.qty * (item.hpp_snapshot || 0)
      
      if (filter === 'this_week') {
        const dayIdx = (tDate.getDay() + 6) % 7
        if (chartData[dayIdx]) chartData[dayIdx].profit += (itemRev - itemHPP)
      } else {
        const d = tDate.getDate()
        const idx = chartData.findIndex(c => c.day === d)
        if (idx !== -1) chartData[idx].profit += (itemRev - itemHPP)
      }
    })
  }

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

  // Top Categories (Based on Rev)
  const categorySales: Record<string, number> = {}
  txnItems?.forEach(item => {
    const prod = item.products as any
    const cat = prod?.category || 'Umum'
    if (!categorySales[cat]) categorySales[cat] = 0
    categorySales[cat] += (item.qty * item.unit_price)
  })

  const topCategories = Object.entries(categorySales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    
  // Sales Source (Kasir vs Sales vs Admin)
  const sourceSalesMap: Record<string, number> = {
    'Kasir (Toko)': 0,
    'Tim Sales': 0,
    'Lainnya (Admin)': 0
  }
  
  txns?.forEach(t => {
    const prof = t.profiles as any
    const role = prof?.role || 'kasir'
    
    if (role === 'kasir') {
      sourceSalesMap['Kasir (Toko)'] += t.total_amount
    } else if (role === 'sales') {
      sourceSalesMap['Tim Sales'] += t.total_amount
    } else {
      sourceSalesMap['Lainnya (Admin)'] += t.total_amount
    }
  })
  
  const sourceSales = Object.entries(sourceSalesMap)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Top Customers
  const customerSalesMap: Record<string, number> = {}
  txns?.forEach(t => {
    let cname = 'Pelanggan Umum'
    if (t.customer_id && t.customers) {
      cname = (t.customers as any).name || 'Pelanggan Umum'
    }
    if (!customerSalesMap[cname]) customerSalesMap[cname] = 0
    customerSalesMap[cname] += t.total_amount
  })
  
  const topCustomers = Object.entries(customerSalesMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Monthly Chart Data (6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  const monthlyChartData: { key: string, name: string, omset: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    monthlyChartData.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
      omset: 0
    })
  }

  monthlyTxns?.forEach(t => {
    const tDate = new Date(t.created_at)
    const key = `${tDate.getFullYear()}-${tDate.getMonth()}`
    const item = monthlyChartData.find(m => m.key === key)
    if (item) {
      item.omset += t.total_amount
    }
  })

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
      monthlyChartData={monthlyChartData}
      topProducts={topProducts}
      topCategories={topCategories}
      sourceSales={sourceSales}
      topCustomers={topCustomers}
      lowStockProducts={actualLowStock}
      filterName={filterName}
      currentFilter={filter}
    />
  )
}
