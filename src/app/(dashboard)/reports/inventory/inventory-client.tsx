'use client'

import { useState } from 'react'
import { ArrowLeft, Package, AlertTriangle, FileClock } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface InventoryClientProps {
  products: any[]
  adjustments: any[]
}

type Tab = 'overview' | 'adjustments'

export default function InventoryClient({ products, adjustments }: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const totalValue = products.reduce((sum, p) => sum + (Number(p.stock_quantity) * Number(p.hpp)), 0)
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock)

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-amber-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" />
              Laporan Inventaris
            </h1>
            <p className="text-sm text-dark-500 mt-1">Nilai aset barang dan riwayat penyesuaian stok.</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'overview' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
            )}
          >
            Nilai & Peringatan Stok
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'adjustments' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
            )}
          >
            Riwayat Penyesuaian
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-dark-100 shadow-sm flex flex-col overflow-hidden">
        {activeTab === 'overview' ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-dark-100 bg-slate-50 flex gap-12">
              <div>
                <p className="text-sm font-semibold text-dark-500 uppercase tracking-wide mb-1">Total Nilai Aset Saat Ini</p>
                <p className="text-3xl font-bold text-dark-900 text-money">{formatRupiah(totalValue)}</p>
                <p className="text-xs text-dark-400 mt-1">Dihitung dari (Sisa Stok x HPP)</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Barang Stok Menipis ({lowStockProducts.length})
              </h3>
              
              {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-dark-400">Semua stok barang masih aman.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="border border-warning/30 bg-warning-light/10 rounded-xl p-4 flex flex-col">
                      <div className="text-xs font-mono text-dark-400 mb-1">{p.sku}</div>
                      <div className="font-semibold text-dark-900 line-clamp-1 mb-3">{p.name}</div>
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-warning/20">
                        <span className="text-sm text-dark-600">Sisa Stok:</span>
                        <span className="font-bold text-danger">{p.stock_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-dark-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-dark-900 flex items-center gap-2">
                <FileClock className="w-5 h-5 text-dark-400" />
                Riwayat Penyesuaian Stok (Adjustment Log)
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="data-table w-full">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    <th>Waktu</th>
                    <th>Produk</th>
                    <th>Tipe</th>
                    <th className="text-center">Perubahan</th>
                    <th>Alasan</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-dark-400">Belum ada riwayat penyesuaian stok.</td>
                    </tr>
                  ) : (
                    adjustments.map(adj => (
                      <tr key={adj.id}>
                        <td className="text-dark-600">{formatDateShort(adj.created_at)}</td>
                        <td className="font-medium text-dark-900">{adj.products?.name}</td>
                        <td>
                          <span className={cn(
                            "badge capitalize", 
                            adj.type === 'tambah' ? 'badge-success' : 'badge-danger'
                          )}>
                            {adj.type}
                          </span>
                        </td>
                        <td className="text-center font-bold text-dark-900">
                          {adj.type === 'tambah' ? '+' : '-'}{Math.abs(adj.qty_change)}
                        </td>
                        <td className="text-dark-600 text-sm max-w-[200px] truncate" title={adj.reason}>{adj.reason}</td>
                        <td className="text-dark-500 text-sm">{adj.profiles?.full_name || 'Sistem'}</td>
                      </tr>
                    ))
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
