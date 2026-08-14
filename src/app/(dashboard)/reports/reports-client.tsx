'use client'

import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Receipt,
  FileText,
  Users,
  Clock,
  Briefcase
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
        },
        {
          title: 'Laporan Piutang',
          description: 'Rincian piutang pelanggan dan batas piutang.',
          icon: Receipt,
          href: '/reports/receivables-report',
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
    },
    {
      title: 'Media Perusahaan',
      reports: [
        {
          title: 'Daftar Customer',
          description: 'Menampilkan data pelanggan lengkap dengan alamat dan kontak.',
          icon: Users,
          href: '/reports/media/customers',
        },
        {
          title: 'Rincian Shift Kerja',
          description: 'Menampilkan histori jam kerja dan laporan saldo tiap kasir.',
          icon: Clock,
          href: '/reports/media/shifts',
        },
        {
          title: 'Daftar Karyawan/Team',
          description: 'Menampilkan data seluruh pengguna sistem dan status mereka.',
          icon: Briefcase,
          href: '/reports/media/employees',
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



      {/* Report Categories Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-auto">
        <div className="space-y-10">
          {reportCategories.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                {category.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6">
                {category.reports.map((report, rIdx) => {
                  const Icon = report.icon
                  return (
                    <Link
                      key={rIdx}
                      href={report.href}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 mt-1">
                        <h3 className="font-semibold text-slate-800 text-sm mb-0.5">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-500">
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
