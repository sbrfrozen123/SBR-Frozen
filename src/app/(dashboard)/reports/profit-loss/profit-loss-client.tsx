'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface ProfitLossClientProps {
  transactions: any[]
  transactionItems: any[]
  expenses: any[]
}

export default function ProfitLossClient({ transactions, transactionItems, expenses }: ProfitLossClientProps) {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month')

  const { totalRevenue, totalCogs, totalExpenses } = useMemo(() => {
    const today = new Date()
    const thisMonthStr = today.toISOString().slice(0, 7)
    
    // For last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7)

    let filterDate = ''
    if (period === 'this_month') filterDate = thisMonthStr
    if (period === 'last_month') filterDate = lastMonthStr

    // Filter Sales
    const filteredTxns = filterDate 
      ? transactions.filter(t => t.created_at.startsWith(filterDate))
      : transactions

    const filteredItems = filterDate
      ? transactionItems.filter(i => i.created_at.startsWith(filterDate))
      : transactionItems

    // Filter Expenses
    const filteredExp = filterDate
      ? expenses.filter(e => e.expense_date.startsWith(filterDate))
      : expenses

    const totalRevenue = filteredTxns.reduce((sum, t) => sum + Number(t.total_amount), 0)
    // COGS = Cost of Goods Sold (Harga Pokok Penjualan)
    // Assuming transaction_items has hpp recorded or we calculate it based on something. 
    // Wait, in schema, transaction_items only has price, qty, subtotal. We didn't record HPP at time of sale.
    // If we didn't record HPP per item at sale, we approximate by currently known HPP.
    const totalCogs = filteredItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.products?.hpp || 0)), 0)
    
    const totalExpenses = filteredExp.reduce((sum, e) => sum + Number(e.amount), 0)

    return { totalRevenue, totalCogs, totalExpenses }
  }, [transactions, transactionItems, expenses, period])

  const grossProfit = totalRevenue - totalCogs
  const netProfit = grossProfit - totalExpenses

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-emerald-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
              Laba Rugi (Profit & Loss)
            </h1>
            <p className="text-sm text-dark-500 mt-1">Kalkulasi performa finansial bisnis Anda.</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm">
          {(['this_month', 'last_month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                period === p ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
              )}
            >
              {p === 'this_month' ? 'Bulan Ini' : p === 'last_month' ? 'Bulan Lalu' : 'Semua Waktu'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-8">
        <div className="space-y-6">
          
          {/* Revenue */}
          <div className="flex justify-between items-end border-b border-dark-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-dark-900">Total Penjualan</h3>
              <p className="text-sm text-dark-500">Pendapatan kotor dari transaksi POS</p>
            </div>
            <div className="text-2xl font-bold text-dark-900 text-money">{formatRupiah(totalRevenue)}</div>
          </div>

          {/* COGS */}
          <div className="flex justify-between items-end border-b border-dark-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-dark-900">Total HPP (Harga Pokok)</h3>
              <p className="text-sm text-dark-500">Modal dasar barang yang terjual</p>
            </div>
            <div className="text-2xl font-bold text-danger text-money">- {formatRupiah(totalCogs)}</div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center bg-primary-50 rounded-xl p-4 border border-primary-100">
            <h3 className="text-lg font-bold text-primary-900">LABA KOTOR (Gross Profit)</h3>
            <div className="text-2xl font-bold text-primary-700 text-money">{formatRupiah(grossProfit)}</div>
          </div>

          {/* Expenses */}
          <div className="flex justify-between items-end border-b border-dark-100 pb-4 mt-8">
            <div>
              <h3 className="text-lg font-bold text-dark-900">Total Biaya Operasional</h3>
              <p className="text-sm text-dark-500">Pengeluaran, logistik, SDM, dll</p>
            </div>
            <div className="text-2xl font-bold text-danger text-money">- {formatRupiah(totalExpenses)}</div>
          </div>

          {/* Net Profit */}
          <div className={cn(
            "flex justify-between items-center rounded-xl p-6 border shadow-sm mt-4",
            netProfit >= 0 ? "bg-emerald-500 border-emerald-600 text-white" : "bg-danger border-danger-dark text-white"
          )}>
            <div>
              <h3 className="text-xl font-black">LABA BERSIH (Net Profit)</h3>
              <p className="text-sm opacity-90 mt-1">Uang bersih yang masuk ke bisnis</p>
            </div>
            <div className="text-4xl font-black text-money tracking-tight">
              {formatRupiah(netProfit)}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
