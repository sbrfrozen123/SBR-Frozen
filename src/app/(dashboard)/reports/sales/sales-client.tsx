'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, TrendingUp, Calendar, FileText, BarChart3, Package, Search } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface SalesClientProps {
  salesData: any[] // From transactions table
  initialFrom: string
  initialTo: string
  initialTab: string
}

export default function SalesClient({ salesData, initialFrom, initialTo, initialTab }: SalesClientProps) {
  const router = useRouter()
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'rincian' | 'terlaris'>(initialTab as any || 'ringkasan')

  const applyFilter = () => {
    router.push(`/reports/sales?from=${fromDate}&to=${toDate}&tab=${activeTab}`)
  }

  // Summaries
  const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalTransactions = salesData.length

  // 1. Chart Data by Salesman
  const chartData = useMemo(() => {
    const grouped: Record<string, any> = {}
    salesData.forEach(sale => {
      const salesman = sale.profiles?.full_name || 'Tidak Diketahui'
      if (!grouped[salesman]) {
        grouped[salesman] = { name: salesman, Penjualan: 0, Kuantitas: 0 }
      }
      grouped[salesman].Penjualan += Number(sale.total_amount)
      grouped[salesman].Kuantitas += (sale.transaction_items || []).reduce((sum: number, item: any) => sum + Number(item.qty), 0)
    })
    return Object.values(grouped)
  }, [salesData])

  // 2. Flattened Data for Detailed Table
  const detailedItems = useMemo(() => {
    const items: any[] = []
    salesData.forEach(sale => {
      sale.transaction_items?.forEach((item: any) => {
        items.push({
          id: item.id,
          invoice_number: sale.invoice_number,
          customer_name: sale.customers?.name || '-',
          product_name: item.product_name || item.products?.name || 'Produk Dihapus',
          qty: item.qty,
          unit: item.unit || '-',
          salesman: sale.profiles?.full_name || '-',
          branch: sale.branches?.name || '-',
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          payment_amount: sale.amount_paid,
        })
      })
    })
    return items
  }, [salesData])

  // 3. Top Products Data
  const topProductsData = useMemo(() => {
    const products: Record<string, any> = {}
    salesData.forEach(sale => {
      sale.transaction_items?.forEach((item: any) => {
        const pid = item.product_name || item.products?.name || 'Produk Dihapus'
        if (!products[pid]) {
          products[pid] = { name: pid, qty: 0, revenue: 0, sku: item.product_sku || item.products?.sku || '-' }
        }
        products[pid].qty += Number(item.qty)
        products[pid].revenue += Number(item.subtotal)
      })
    })
    return Object.values(products).sort((a, b) => b.qty - a.qty)
  }, [salesData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-dark-100 shadow-xl rounded-xl">
          <p className="font-bold text-dark-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.name === 'Penjualan' ? formatRupiah(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in bg-slate-50/50">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-primary-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-500" />
              Laporan Penjualan
            </h1>
            <p className="text-sm text-dark-500 mt-1">Rincian faktur dan grafik penjualan berdasarkan kasir.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-dark-100 shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-dark-400" />
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border-none focus:ring-0 text-dark-700 bg-transparent"
            />
            <span className="text-dark-300">s/d</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border-none focus:ring-0 text-dark-700 bg-transparent"
            />
          </div>
          <button 
            onClick={applyFilter}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tampilkan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm self-start">
        <button
          onClick={() => {
            setActiveTab('ringkasan')
            router.push(`/reports/sales?from=${fromDate}&to=${toDate}&tab=ringkasan`)
          }}
          className={cn(
            'px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
            activeTab === 'ringkasan' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
          )}
        >
          <BarChart3 className="w-4 h-4" /> Grafik & Ringkasan
        </button>
        <button
          onClick={() => {
            setActiveTab('rincian')
            router.push(`/reports/sales?from=${fromDate}&to=${toDate}&tab=rincian`)
          }}
          className={cn(
            'px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
            activeTab === 'rincian' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
          )}
        >
          <FileText className="w-4 h-4" /> Rincian Faktur
        </button>
        <button
          onClick={() => {
            setActiveTab('terlaris')
            router.push(`/reports/sales?from=${fromDate}&to=${toDate}&tab=terlaris`)
          }}
          className={cn(
            'px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
            activeTab === 'terlaris' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
          )}
        >
          <Package className="w-4 h-4" /> Barang Paling Laku
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'ringkasan' && (
          <div className="flex flex-col gap-6 h-full animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
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

            <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm flex-1 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-dark-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Grafik Penjualan per Kasir (Salesman)
              </h3>
              {chartData.length > 0 ? (
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar yAxisId="left" dataKey="Penjualan" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <Bar yAxisId="right" dataKey="Kuantitas" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-dark-400">
                  Tidak ada data penjualan pada periode ini.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rincian' && (
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm flex flex-col h-full overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-dark-100 bg-slate-50 flex-shrink-0">
              <h3 className="font-bold text-dark-900">Rincian Faktur Penjualan</h3>
              <p className="text-xs text-dark-500 mt-1">Menampilkan setiap barang yang terjual dari struk.</p>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-dark-500 uppercase bg-dark-50/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nomor SO</th>
                    <th className="px-6 py-4 font-semibold">Pelanggan</th>
                    <th className="px-6 py-4 font-semibold">Nama Barang</th>
                    <th className="px-6 py-4 font-semibold text-right">Kuantitas</th>
                    <th className="px-6 py-4 font-semibold">UoM</th>
                    <th className="px-6 py-4 font-semibold">Salesman</th>
                    <th className="px-6 py-4 font-semibold">Gudang</th>
                    <th className="px-6 py-4 font-semibold text-right">Harga Jual</th>
                    <th className="px-6 py-4 font-semibold text-right">Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {detailedItems.length > 0 ? (
                    detailedItems.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-dark-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-dark-900">{item.invoice_number}</td>
                        <td className="px-6 py-4 text-dark-600">{item.customer_name}</td>
                        <td className="px-6 py-4 text-dark-900">{item.product_name}</td>
                        <td className="px-6 py-4 text-right font-medium text-dark-900">{item.qty}</td>
                        <td className="px-6 py-4 text-dark-500">{item.unit}</td>
                        <td className="px-6 py-4 text-dark-600">{item.salesman}</td>
                        <td className="px-6 py-4 text-dark-600">{item.branch}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{formatRupiah(item.unit_price)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-primary-600">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-dark-400">
                        Tidak ada data rincian faktur pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'terlaris' && (
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm flex flex-col h-full overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-dark-100 bg-slate-50 flex-shrink-0">
              <h3 className="font-bold text-dark-900">Barang Paling Laku</h3>
              <p className="text-xs text-dark-500 mt-1">Daftar produk yang diurutkan berdasarkan kuantitas penjualan tertinggi.</p>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-dark-500 uppercase bg-dark-50/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16 text-center">No</th>
                    <th className="px-6 py-4 font-semibold">Nama Produk</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold text-right">Kuantitas Terjual</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {topProductsData.length > 0 ? (
                    topProductsData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-dark-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-dark-400 text-center">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-dark-900">{item.name}</td>
                        <td className="px-6 py-4 text-dark-500 font-mono text-xs">{item.sku}</td>
                        <td className="px-6 py-4 text-right font-bold text-primary-600">{item.qty}</td>
                        <td className="px-6 py-4 text-right font-semibold text-dark-900">{formatRupiah(item.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-dark-400">
                        Tidak ada data penjualan barang pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
