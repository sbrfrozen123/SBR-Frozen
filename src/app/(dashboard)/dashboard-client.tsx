'use client'

import { formatRupiah } from '@/lib/utils/currency'
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Package, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface DashboardClientProps {
  userName: string
  role: string
  stats: {
    omset: number
    grossProfit: number
    netProfit: number
    expenses: number
    piutang: number
  }
  chartData: any[]
  topProducts: any[]
  lowStockProducts: any[]
  monthName: string
}

export default function DashboardClient({ 
  userName, role, stats, chartData, topProducts, lowStockProducts, monthName 
}: DashboardClientProps) {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-dark-100 shadow-xl rounded-xl">
          <p className="text-dark-600 text-xs mb-2">Tanggal {label} {monthName}</p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary-600">
              Omset: {formatRupiah(payload[0].value)}
            </p>
            {payload[1] && (
              <p className="text-sm font-bold text-success-dark">
                Laba Kotor: {formatRupiah(payload[1].value)}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
            Halo, {userName} 👋
          </h1>
          <p className="text-dark-500 mt-1">
            Berikut adalah ringkasan performa bisnis bulan <span className="font-semibold text-dark-900">{monthName}</span>.
          </p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-dark-100 shadow-sm text-sm font-medium text-dark-600">
          Login sebagai: <span className="text-primary-600 uppercase tracking-wider text-xs ml-1">{role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset */}
        <div className="summary-card summary-card-primary group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Total Omset</p>
              <p className="text-3xl font-bold text-dark-900 text-money mb-1 tracking-tight">
                {formatRupiah(stats.omset)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="summary-card summary-card-success group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Laba Bersih</p>
              <p className="text-3xl font-bold text-dark-900 text-money mb-1 tracking-tight">
                {formatRupiah(stats.netProfit)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-success-light/30 flex justify-between text-xs text-dark-500">
            <span>Laba Kotor: {formatRupiah(stats.grossProfit)}</span>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="summary-card summary-card-danger group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Total Pengeluaran</p>
              <p className="text-3xl font-bold text-dark-900 text-money mb-1 tracking-tight">
                {formatRupiah(stats.expenses)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6 text-danger" />
            </div>
          </div>
        </div>

        {/* Piutang */}
        <div className="summary-card summary-card-warning group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Piutang Beredar</p>
              <p className="text-3xl font-bold text-dark-900 text-money mb-1 tracking-tight">
                {formatRupiah(stats.piutang)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-warning-dark" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-dark-900">Grafik Penjualan Harian</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E91E8C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="omset" 
                  stroke="#E91E8C" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOmset)" 
                />
                {role === 'super_admin' && (
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar Lists */}
        <div className="space-y-6">
          
          {/* Top Products */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-dark-900">Produk Terlaris</h3>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-dark-400">Belum ada penjualan bulan ini.</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-dark-50 text-dark-500 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="text-sm font-semibold text-dark-900 max-w-[120px] truncate">{p.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-primary-600">{p.qty} terjual</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card p-6 border-danger/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-danger-light rounded-lg">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <h3 className="font-bold text-dark-900">Peringatan Stok</h3>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-dark-400">Semua stok produk aman.</p>
              ) : (
                lowStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} className="p-3 bg-danger-light/10 border border-danger-light rounded-lg flex items-center justify-between">
                    <span className="text-sm font-semibold text-dark-900 line-clamp-1">{p.name}</span>
                    <span className="text-xs font-bold text-danger px-2 py-1 bg-white rounded shadow-sm">
                      Sisa {p.stock_quantity}
                    </span>
                  </div>
                ))
              )}
              {lowStockProducts.length > 4 && (
                <div className="text-center pt-2">
                  <a href="/inventory" className="text-xs font-medium text-primary-600 hover:underline">
                    Lihat {lowStockProducts.length - 4} produk lainnya &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
