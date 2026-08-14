'use client'

import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Package, AlertTriangle, Calendar, CheckCircle2, Users
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

interface DashboardClientProps {
  userName: string
  role: string
  stats: {
    omset: number
    grossProfit: number
    netProfit: number
    expenses: number
    piutang: number
    assetValue: number
  }
  chartData: any[]
  topProducts: any[]
  topCategories: any[]
  sourceSales: any[]
  topCustomers: any[]
  lowStockProducts: any[]
  filterName: string
  currentFilter: string
  monthlyChartData: any[]
}

export default function DashboardClient({ 
  userName, role, stats, chartData, monthlyChartData, topProducts, topCategories, sourceSales, topCustomers, lowStockProducts, filterName, currentFilter 
}: DashboardClientProps) {
  const router = useRouter()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-dark-100 shadow-xl rounded-xl">
          <p className="text-dark-600 text-xs mb-2">
            {currentFilter === 'today' ? `Pukul ${label}` : label?.includes('-') ? `Bulan ${label}` : `Tanggal ${label}`}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary-600">
              Omset: {formatRupiah(payload[0].value)}
            </p>
            {payload[1] && payload[1].dataKey === 'profit' && (
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

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-dark-100 shadow-xl rounded-xl">
          <p className="text-dark-900 font-bold mb-1">{payload[0].name}</p>
          <p className="text-sm font-semibold text-primary-600">
            {formatRupiah(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white rounded-2xl p-5 border border-dark-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-dark-900 tracking-tight mb-1">
            Halo, {userName} 👋
          </h1>
          <p className="text-dark-500 font-medium">
            Berikut adalah ringkasan performa bisnis Anda untuk periode <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">{filterName}</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-dark-100 shadow-sm text-sm font-medium text-dark-600 flex items-center justify-center">
            Login sebagai: <span className="text-primary-600 uppercase tracking-wider text-xs ml-1">{role.replace('_', ' ')}</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-dark-400" />
            </div>
            <select
              value={currentFilter}
              onChange={(e) => router.push(`?filter=${e.target.value}`)}
              className="pl-10 pr-8 py-2 w-full sm:w-auto bg-white border border-dark-200 rounded-xl text-sm font-bold text-dark-800 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-danger-600 bg-white p-2 rounded-lg border border-danger-100 shadow-sm shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-danger-800 font-bold mb-1">
              Peringatan: {lowStockProducts.length} Produk Menipis!
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockProducts.slice(0, 5).map((p, i) => (
                <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-white text-danger-700 border border-danger-200 shadow-sm">
                  {p.name} <span className="ml-1 opacity-70">({p.stock_quantity})</span>
                </span>
              ))}
              {lowStockProducts.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold text-danger-700">
                  +{lowStockProducts.length - 5} lainnya...
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => router.push('/inventory')}
            className="shrink-0 bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors mt-2 sm:mt-0"
          >
            Lihat Inventory
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {/* Omset */}
        <div className="p-4 xl:p-5 rounded-2xl relative overflow-hidden bg-white border border-primary-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start relative z-10">
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></div> Total Omset
              </p>
              <p className="text-xl xl:text-2xl font-black text-primary-700 mb-1 tracking-tight truncate">
                {formatRupiah(stats.omset)}
              </p>
            </div>
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-primary-50 shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300 ml-2">
              <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="p-4 xl:p-5 rounded-2xl relative overflow-hidden bg-white border border-success-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-success-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-success-500 shrink-0"></div> Laba Bersih
              </p>
              <p className="text-xl xl:text-2xl font-black text-success-700 mb-1 tracking-tight truncate">
                {formatRupiah(stats.netProfit)}
              </p>
            </div>
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-success-50 shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:bg-success-100 transition-all duration-300 ml-2">
              <DollarSign className="w-5 h-5 xl:w-6 xl:h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-100 flex justify-between text-xs font-medium text-dark-500 truncate">
            <span>Laba Kotor: <span className="font-bold text-dark-700">{formatRupiah(stats.grossProfit)}</span></span>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 xl:p-5 rounded-2xl relative overflow-hidden bg-white border border-danger-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-danger-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-danger-500 shrink-0"></div> Pengeluaran
              </p>
              <p className="text-xl xl:text-2xl font-black text-danger-700 mb-1 tracking-tight truncate">
                {formatRupiah(stats.expenses)}
              </p>
            </div>
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-danger-50 shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:bg-danger-100 transition-all duration-300 ml-2">
              <TrendingDown className="w-5 h-5 xl:w-6 xl:h-6 text-danger-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-100 flex justify-between text-xs font-medium text-dark-500 truncate">
            <span>Beban Operasional</span>
          </div>
        </div>

        {/* Piutang */}
        <div className="p-4 xl:p-5 rounded-2xl relative overflow-hidden bg-white border border-warning-200 shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-warning-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-warning-500 shrink-0"></div> Piutang
              </p>
              <p className="text-xl xl:text-2xl font-black text-warning-700 mb-1 tracking-tight truncate">
                {formatRupiah(stats.piutang)}
              </p>
            </div>
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-warning-50 shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:bg-warning-100 transition-all duration-300 ml-2">
              <Wallet className="w-5 h-5 xl:w-6 xl:h-6 text-warning-600" />
            </div>
          </div>
        </div>
        {/* Aset Barang */}
        <div className="p-4 xl:p-5 rounded-2xl relative overflow-hidden bg-white border border-indigo-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div> Aset Barang
              </p>
              <p className="text-xl xl:text-2xl font-black text-indigo-700 mb-1 tracking-tight truncate">
                {formatRupiah(stats.assetValue)}
              </p>
            </div>
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-indigo-50 shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300 ml-2">
              <Package className="w-5 h-5 xl:w-6 xl:h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts & Pies) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Chart */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-dark-900">Trend Penjualan</h3>
            <span className="text-xs font-bold text-dark-500 bg-dark-50 px-3 py-1.5 rounded-lg border border-dark-100">{filterName}</span>
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

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-dark-900">Tren 6 Bulan Terakhir</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Bar 
                  dataKey="omset" 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
          
          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Categories Pie Chart */}
            <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-dark-900">Kategori Terlaris</h3>
              </div>
              
              {topCategories.length === 0 ? (
                <p className="text-sm text-dark-400">Belum ada data kategori.</p>
              ) : (
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-semibold text-dark-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-xs font-bold text-dark-400">Total</span>
                    <span className="text-sm font-black text-dark-900">
                      {formatRupiah(topCategories.reduce((acc, curr) => acc + curr.value, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Source Pie Chart */}
            <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-dark-900">Sumber Penjualan</h3>
              </div>
              
              {sourceSales.length === 0 ? (
                <p className="text-sm text-dark-400">Belum ada data penjualan.</p>
              ) : (
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceSales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {sourceSales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-semibold text-dark-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-xs font-bold text-dark-400">Total</span>
                    <span className="text-sm font-black text-dark-900">
                      {formatRupiah(sourceSales.reduce((acc, curr) => acc + curr.value, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Lists */}
        <div className="space-y-6 flex flex-col">
          
          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
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
          
          {/* Top Customers */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-dark-900">Top 10 Pelanggan</h3>
            </div>
            <div className="space-y-4">
              {topCustomers.length === 0 ? (
                <p className="text-sm text-dark-400">Belum ada data pelanggan bulan ini.</p>
              ) : (
                topCustomers.map((c, i) => {
                  const maxTotal = topCustomers[0].total || 1
                  const percentage = Math.round((c.total / maxTotal) * 100)
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-dark-900 line-clamp-1">{c.name}</span>
                        <span className="font-bold text-primary-600">{formatRupiah(c.total)}</span>
                      </div>
                      <div className="w-full bg-dark-50 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-primary-500 h-1.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
