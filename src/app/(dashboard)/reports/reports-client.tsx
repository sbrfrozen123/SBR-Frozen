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
          title: 'Ringkasan Keuangan',
          description: 'Rincian penerimaan uang berdasarkan metode pembayaran (Cash/Transfer/QRIS).',
          icon: BarChart3,
          href: '/reports/financial-summary',
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
          title: 'Grafik Penjualan',
          description: 'Laporan grafik penjualan berdasarkan kasir.',
          icon: BarChart3,
          href: '/reports/sales/grafik',
        },
        {
          title: 'Rincian Faktur Penjualan',
          description: 'Laporan yang berisi rincian barang pada faktur penjualan.',
          icon: FileText,
          href: '/reports/sales/rincian',
        },
        {
          title: 'Barang Paling Laku',
          description: 'Menampilkan laporan barang paling laku diurutkan berdasar kuantitas.',
          icon: Package,
          href: '/reports/sales/terlaris',
        }
      ]
    },
    {
      title: 'Pembelian',
      reports: [
        {
          title: 'Rincian Pembelian Barang',
          description: 'Laporan yang berisi rincian faktur pembelian ke pemasok.',
          icon: Receipt,
          href: '/reports/purchases/rincian',
        },
        {
          title: 'Rincian Penerimaan Barang',
          description: 'Laporan penerimaan barang secara fisik ke gudang.',
          icon: Package,
          href: '/reports/purchases/penerimaan',
        }
      ]
    },
    {
      title: 'Persediaan',
      reports: [
        {
          title: 'Nilai Persediaan Barang',
          description: 'Laporan nilai aset stok berjalan per cabang.',
          icon: Package,
          href: '/reports/inventory/value',
        },
        {
          title: 'Riwayat Penyesuaian Stok',
          description: 'Laporan log mutasi dan penyesuaian stok (Adjustment).',
          icon: FileText,
          href: '/reports/inventory/adjustments',
        }
      ]
    }
  ]

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-dark-100 flex-shrink-0 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary-50/50 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-dark-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Pusat Laporan
          </h1>
          <p className="text-sm text-dark-500 mt-1 font-medium">Pantau metrik utama dan akses laporan lengkap untuk analisis performa bisnis.</p>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <p className="text-xs font-bold text-dark-400 uppercase tracking-widest relative z-10">Penjualan Bulan Ini</p>
          <p className="text-xl font-black text-dark-900 mt-2 relative z-10">{formatRupiah(summary.totalSales)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-danger-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <p className="text-xs font-bold text-dark-400 uppercase tracking-widest relative z-10">Pengeluaran Bulan Ini</p>
          <p className="text-xl font-black text-danger-600 mt-2 relative z-10">{formatRupiah(summary.totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-success-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <p className="text-xs font-bold text-dark-400 uppercase tracking-widest relative z-10">Nilai Inventaris</p>
          <p className="text-xl font-black text-dark-900 mt-2 relative z-10">{formatRupiah(summary.totalInventoryValue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-warning-200 p-5 shadow-sm bg-warning-50/30 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-warning-100 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <p className="text-xs font-bold text-warning-700 uppercase tracking-widest relative z-10">Peringatan Stok</p>
          <p className="text-xl font-black text-warning-700 mt-2 relative z-10">{summary.lowStockCount} <span className="text-sm font-medium">Barang Menipis</span></p>
        </div>
      </div>

      {/* Report Categories */}
      <div className="flex-1 overflow-auto hide-scrollbar space-y-6 pb-6">
        {reportCategories.map((category, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-dark-900 tracking-wide uppercase">
                {category.title}
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/30">
              {category.reports.map((report, rIdx) => {
                const Icon = report.icon
                return (
                  <Link
                    key={rIdx}
                    href={report.href}
                    className="flex flex-col p-5 bg-white rounded-xl border border-dark-100 shadow-sm hover:shadow-md hover:border-primary-300 hover:ring-1 hover:ring-primary-300 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-dark-500 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-4 border border-dark-100 group-hover:border-primary-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-dark-900 group-hover:text-primary-700 transition-colors text-base mb-1.5 line-clamp-1">
                        {report.title}
                      </h3>
                      <p className="text-sm text-dark-500 leading-relaxed font-medium line-clamp-2">
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
  )
}
