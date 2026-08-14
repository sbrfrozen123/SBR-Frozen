'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, TrendingUp, Filter, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface SalesClientProps {
  salesData: any[] // From transactions table
  topProducts: any[] // Aggregated from transaction_items
}

export default function SalesClient({ salesData, topProducts }: SalesClientProps) {
  const [period, setPeriod] = useState<'today' | 'this_month' | 'all'>('this_month')

  // Filter sales data locally based on selected period
  const filteredSales = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const thisMonthStr = today.toISOString().slice(0, 7) // YYYY-MM

    return salesData.filter(sale => {
      const saleDate = sale.created_at.split('T')[0]
      if (period === 'today') return saleDate === todayStr
      if (period === 'this_month') return saleDate.startsWith(thisMonthStr)
      return true
    })
  }, [salesData, period])

  // Summaries
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalTransactions = filteredSales.length
  
  // Note: Top Products is passed pre-aggregated for the month from server for performance. 
  // In a full app, we would re-fetch or filter this locally too.

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-primary-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-500" />
              Laporan Penjualan
            </h1>
            <p className="text-sm text-dark-500 mt-1">Ringkasan pendapatan dan performa penjualan produk.</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm">
          {(['today', 'this_month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                period === p ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
              )}
            >
              {p === 'today' ? 'Hari Ini' : p === 'this_month' ? 'Bulan Ini' : 'Semua Waktu'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Summaries & Chart Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-6 relative overflow-hidden bg-gradient-primary text-white group border-none shadow-glow-primary">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2 relative z-10">Total Pendapatan</p>
              <p className="text-3xl font-bold text-white tracking-tight font-mono relative z-10">{formatRupiah(totalRevenue)}</p>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
            </div>
            <div className="card p-6 bg-white">
              <p className="text-sm font-semibold text-dark-500 uppercase tracking-wide mb-2">Total Transaksi</p>
              <p className="text-3xl font-bold text-primary-600 font-mono">{totalTransactions} <span className="text-base font-medium text-dark-400 normal-case tracking-normal font-sans">struk</span></p>
            </div>
          </div>

          {/* Placeholder for future charts */}
          <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm flex-1 flex flex-col items-center justify-center text-dark-300">
            <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Grafik Penjualan Harian (Dalam Pengembangan)</p>
          </div>
        </div>

        {/* Right Column: Top Products */}
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-dark-100 bg-slate-50">
            <h3 className="font-bold text-dark-900 flex items-center gap-2">
              🏆 Produk Terlaris
            </h3>
            <p className="text-xs text-dark-500 mt-1">Bulan Ini (Top 10)</p>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-dark-400 text-sm">Belum ada penjualan bulan ini.</div>
            ) : (
              <div className="space-y-1">
                {topProducts.map((item, index) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 hover:bg-dark-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-dark-900 text-sm truncate">{item.products?.name || 'Produk Dihapus'}</h4>
                      <p className="text-xs text-dark-500">{item.products?.sku || '-'}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-dark-900">{item.total_qty}</div>
                      <div className="text-xs text-dark-400">terjual</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
