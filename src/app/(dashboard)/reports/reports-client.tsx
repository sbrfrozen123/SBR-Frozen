'use client'

import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Receipt,
  FileText
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'

interface ReportsClientProps {
  summary: {
    totalSales: number
    totalExpenses: number
    totalInventoryValue: number
    lowStockCount: number
  }
}

export default function ReportsClient({ summary }: ReportsClientProps) {
  const reportCategories = [
    {
      title: 'Keuangan',
      reports: [
        {
          title: 'Laba Rugi (Profit & Loss)',
          description: 'Perhitungan Laba Kotor dan Laba Bersih secara otomatis.',
          icon: BarChart3,
          href: '/reports/profit-loss',
        },
        {
          title: 'Laporan Pengeluaran',
          description: 'Rekapitulasi biaya operasional, logistik, dan SDM.',
          icon: Receipt,
          href: '/reports/expenses-report',
        }
      ]
    },
    {
      title: 'Penjualan',
      reports: [
        {
          title: 'Laporan Penjualan',
          description: 'Analisis pendapatan, jumlah transaksi, dan produk terlaris.',
          icon: TrendingUp,
          href: '/reports/sales',
        }
      ]
    },
    {
      title: 'Persediaan',
      reports: [
        {
          title: 'Laporan Inventaris',
          description: 'Nilai aset stok berjalan dan riwayat penyesuaian stok (Adjustment).',
          icon: Package,
          href: '/reports/inventory',
        }
      ]
    }
  ]

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-500" />
            Daftar Laporan
          </h1>
          <p className="text-sm text-dark-500 mt-1">Pilih modul laporan untuk melihat analisis detail bisnis Anda.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white rounded-xl border border-dark-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-dark-500 uppercase">Penjualan Bulan Ini</p>
          <p className="text-lg font-bold text-dark-900 mt-1">{formatRupiah(summary.totalSales)}</p>
        </div>
        <div className="bg-white rounded-xl border border-dark-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-dark-500 uppercase">Pengeluaran Bulan Ini</p>
          <p className="text-lg font-bold text-danger mt-1">{formatRupiah(summary.totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl border border-dark-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-dark-500 uppercase">Nilai Inventaris</p>
          <p className="text-lg font-bold text-dark-900 mt-1">{formatRupiah(summary.totalInventoryValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-warning/30 p-4 shadow-sm bg-warning-light/10">
          <p className="text-xs font-semibold text-dark-600 uppercase">Peringatan Stok</p>
          <p className="text-lg font-bold text-warning-700 mt-1">{summary.lowStockCount} Barang Menipis</p>
        </div>
      </div>

      {/* Report List accurate style */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm flex-1 overflow-auto">
        <div className="p-6 space-y-8">
          {reportCategories.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-bold text-dark-900 mb-4 pb-2 border-b border-dark-100">
                {category.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.reports.map((report, rIdx) => {
                  const Icon = report.icon
                  return (
                    <Link
                      key={rIdx}
                      href={report.href}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-dark-100 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-dark-900 group-hover:text-primary-600 transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-sm text-dark-500 mt-0.5 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
