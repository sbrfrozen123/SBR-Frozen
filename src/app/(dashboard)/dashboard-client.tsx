'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  ShoppingCart, Package, Receipt, ArrowRight, Clock,
  CheckCircle, XCircle, Zap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { formatRupiah, formatRupiahCompact } from '@/lib/utils/currency'
import { formatDateTimeID, formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

const PAYMENT_LABELS: Record<string, string> = {
  tunai: 'Tunai',
  transfer: 'Transfer',
  qris: 'QRIS',
  tempo: 'Tempo',
}

const PAYMENT_COLORS: Record<string, string> = {
  tunai: 'bg-emerald-100 text-emerald-700',
  transfer: 'bg-blue-100 text-blue-700',
  qris: 'bg-violet-100 text-violet-700',
  tempo: 'bg-amber-100 text-amber-700',
}

// Mock weekly chart data — in production this comes from Supabase RPC
const mockWeekData = [
  { day: 'Sen', revenue: 2400000, transactions: 12 },
  { day: 'Sel', revenue: 3200000, transactions: 18 },
  { day: 'Rab', revenue: 1800000, transactions: 9 },
  { day: 'Kam', revenue: 4100000, transactions: 22 },
  { day: 'Jum', revenue: 5200000, transactions: 28 },
  { day: 'Sab', revenue: 6800000, transactions: 35 },
  { day: 'Min', revenue: 3900000, transactions: 20 },
]

interface DashboardClientProps {
  todayRevenue: number
  totalReceivables: number
  totalMonthlyExpenses: number
  lowStockProducts: Array<{
    id: string; name: string; sku: string
    stock_quantity: number; min_stock_alert: number; unit: string
  }>
  overdueReceivablesCount: number
  recentTransactions: Array<{
    id: string; invoice_number: string; total_amount: number
    payment_method: string; payment_status: string; created_at: string
    customers: { name: string } | null
  }>
}

// Animated counter hook
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const steps = 40
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function SummaryCard({
  title, value, subtitle, icon: Icon, colorClass, trend, trendValue, href
}: {
  title: string; value: string; subtitle?: string
  icon: React.ElementType; colorClass: string; trend?: 'up' | 'down' | 'neutral'
  trendValue?: string; href?: string
}) {
  const card = (
    <div className={cn('summary-card', colorClass, 'group cursor-default')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-bold text-dark-900 text-money mb-1">{value}</p>
          {subtitle && <p className="text-xs text-dark-400">{subtitle}</p>}
          {trendValue && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-dark-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          trend === 'up' ? 'bg-success-light' :
          trend === 'down' ? 'bg-danger-light' : 'bg-dark-50'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            trend === 'up' ? 'text-success' :
            trend === 'down' ? 'text-danger' : 'text-dark-400'
          )} />
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} className="block hover:-translate-y-0.5 transition-transform">{card}</Link>
  }
  return card
}

export default function DashboardClient({
  todayRevenue,
  totalReceivables,
  totalMonthlyExpenses,
  lowStockProducts,
  overdueReceivablesCount,
  recentTransactions,
}: DashboardClientProps) {
  const animatedRevenue = useCountUp(todayRevenue)

  const quickActions = [
    { href: '/pos', icon: ShoppingCart, label: 'Transaksi Baru', color: 'bg-primary-50 text-primary-600 hover:bg-primary-100' },
    { href: '/inventory', icon: Package, label: 'Tambah Stok', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { href: '/expenses', icon: Receipt, label: 'Catat Pengeluaran', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { href: '/receivables', icon: AlertTriangle, label: 'Piutang Jatuh Tempo', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle flex items-center gap-1.5">
            <span className="realtime-dot" />
            Data real-time · {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/pos" className="btn-md btn-primary">
          <ShoppingCart className="w-4 h-4" />
          POS Kasir
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5',
              color
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(animatedRevenue)}
          subtitle="Transaksi lunas"
          icon={DollarSign}
          colorClass="summary-card-primary"
          trend="up"
          trendValue="Update real-time"
          href="/reports/sales"
        />
        <SummaryCard
          title="Piutang Aktif"
          value={formatRupiah(totalReceivables)}
          subtitle={overdueReceivablesCount > 0 ? `${overdueReceivablesCount} melewati jatuh tempo` : 'Semua dalam batas'}
          icon={AlertTriangle}
          colorClass="summary-card-danger"
          trend={overdueReceivablesCount > 0 ? 'down' : 'neutral'}
          trendValue={overdueReceivablesCount > 0 ? `${overdueReceivablesCount} overdue` : undefined}
          href="/receivables"
        />
        <SummaryCard
          title="Pengeluaran Bulan Ini"
          value={formatRupiah(totalMonthlyExpenses)}
          subtitle="Total biaya operasional"
          icon={Receipt}
          colorClass="summary-card-warning"
          trend="neutral"
          href="/reports/expenses-report"
        />
        <SummaryCard
          title="Stok Perlu Perhatian"
          value={`${lowStockProducts.length} Produk`}
          subtitle="Stok di bawah minimum"
          icon={Package}
          colorClass="summary-card-accent"
          trend={lowStockProducts.length > 0 ? 'down' : 'neutral'}
          href="/inventory"
        />
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Sales Chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-dark-900">Tren Penjualan</h3>
              <p className="text-xs text-dark-400 mt-0.5">7 hari terakhir</p>
            </div>
            <Link href="/reports/sales" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
              Lihat Detail <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockWeekData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E91E8C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatRupiahCompact(v)}
              />
              <Tooltip
                contentStyle={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatRupiah(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E91E8C"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: '#E91E8C', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#E91E8C', strokeWidth: 0, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Center */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-dark-900">Alert Center</h3>
          </div>
          <div className="space-y-3">
            {/* Low stock alerts */}
            {lowStockProducts.length === 0 && overdueReceivablesCount === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="w-10 h-10 text-success mb-2" />
                <p className="text-sm font-medium text-dark-600">Semua Normal</p>
                <p className="text-xs text-dark-400 mt-0.5">Tidak ada alert aktif</p>
              </div>
            ) : (
              <>
                {overdueReceivablesCount > 0 && (
                  <Link href="/receivables" className="flex items-start gap-3 p-3 rounded-xl bg-danger-light hover:bg-danger-light/80 transition-colors group">
                    <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-danger-dark">{overdueReceivablesCount} Piutang Overdue</p>
                      <p className="text-xs text-danger-dark/70 mt-0.5">Segera tindak lanjuti</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-danger ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                )}
                {lowStockProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} href="/inventory" className="flex items-center gap-3 p-3 rounded-xl bg-warning-light hover:bg-warning-light/80 transition-colors group">
                    <Package className="w-4 h-4 text-warning-dark flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warning-dark truncate">{product.name}</p>
                      <p className="text-xs text-warning-dark/70">
                        Sisa: {product.stock_quantity} {product.unit}
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-dark-100">
          <div>
            <h3 className="font-semibold text-dark-900">Transaksi Terbaru</h3>
            <p className="text-xs text-dark-400 mt-0.5">5 transaksi terakhir</p>
          </div>
          <Link href="/reports/sales" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Metode</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-dark-400">
                    Belum ada transaksi hari ini
                  </td>
                </tr>
              ) : (
                recentTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="font-mono text-xs font-medium">{txn.invoice_number}</td>
                    <td className="text-dark-600">
                      {(txn.customers as { name: string } | null)?.name || '— Walk-in —'}
                    </td>
                    <td>
                      <span className={cn('badge', PAYMENT_COLORS[txn.payment_method] || 'bg-dark-100 text-dark-600')}>
                        {PAYMENT_LABELS[txn.payment_method] || txn.payment_method}
                      </span>
                    </td>
                    <td>
                      <span className={cn('badge', txn.payment_status === 'lunas' ? 'badge-success' : 'badge-danger')}>
                        {txn.payment_status === 'lunas' ? 'Lunas' : 'Piutang'}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-money">
                      {formatRupiah(txn.total_amount)}
                    </td>
                    <td className="text-dark-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateShort(txn.created_at)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
