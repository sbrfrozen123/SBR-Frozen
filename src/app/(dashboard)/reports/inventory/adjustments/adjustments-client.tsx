'use client'

import { useState } from 'react'
import { Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface AdjustmentsClientProps {
  adjustments: any[]
  branches: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function AdjustmentsClient({
  adjustments,
  branches,
  initialFrom,
  initialTo,
  initialBranch
}: AdjustmentsClientProps) {
  const router = useRouter()
  
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formattedFrom = initialFrom ? new Date(initialFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const formattedTo = initialTo ? new Date(initialTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  const displayBranch = initialBranch === 'all' || !initialBranch 
    ? '[Semua Gudang]' 
    : branches.find(b => b.id === initialBranch)?.name || '[Semua Gudang]'

  const applyFilter = () => {
    setShowModal(false)
    let url = `/reports/inventory/adjustments?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const exportToCSV = () => {
    const headers = ['Waktu', 'Kode Barang', 'Nama Barang', 'Gudang', 'Tipe', 'Perubahan', 'UoM', 'Alasan', 'User']
    const csvData = adjustments.map(item => [
      item.created_at,
      item.product_sku,
      item.product_name,
      item.branch_name,
      item.type,
      item.qty_change,
      item.unit,
      item.reason,
      item.user_name
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Riwayat_Penyesuaian_Stok_${initialFrom}_${initialTo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col items-center py-8 relative font-sans print:bg-white print:py-0 print:block">
      {/* Global CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      {/* Floating Toolbar (Hidden on Print) */}
      <div className="print-hidden sticky top-4 z-40 bg-white shadow-lg border border-dark-200 rounded-full px-6 py-3 flex items-center gap-6 mb-8 transition-all">
        <Link href="/reports" className="text-dark-500 hover:text-dark-900 transition-colors flex items-center gap-1 border-r border-dark-200 pr-4">
          <ChevronLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowModal(true)} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <Settings2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Parameter</span>
          </button>
          <button onClick={handleRefresh} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <RefreshCw className={cn("w-5 h-5 group-hover:scale-110 transition-transform", isRefreshing && "animate-spin")} />
            <span className="text-[10px] font-bold mt-1">Refresh</span>
          </button>
          <button onClick={exportToCSV} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Export</span>
          </button>
          <button onClick={() => window.print()} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Print</span>
          </button>
        </div>
      </div>

      {/* Report Document Page */}
      <div className="bg-white shadow-xl max-w-[1200px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-0">
        
        {/* Header Document */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">SBR FROZEN</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Laporan Penyesuaian</h1>
          <p className="text-sm text-dark-700 mt-1">
            Dari {formattedFrom || '-'} s/d {formattedTo || '-'}
          </p>
        </div>

        {/* Info Right */}
        <div className="flex justify-end mb-4">
          <p className="text-xs italic text-dark-600">Gudang : {displayBranch}</p>
        </div>

        {/* Data Table */}
        <div className="w-full">
          {(!initialFrom || !initialTo) ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Silakan atur Parameter Laporan terlebih dahulu untuk menampilkan data.
            </div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Tidak ada data penyesuaian pada rentang tanggal ini.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-t-2 border-b-2 border-dark-900 text-dark-900">
                  <th className="py-3 px-2 font-bold whitespace-nowrap">Waktu</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">Kode Barang</th>
                  <th className="py-3 px-2 font-bold">Nama Barang</th>
                  <th className="py-3 px-2 font-bold">Gudang</th>
                  <th className="py-3 px-2 font-bold text-center">Tipe</th>
                  <th className="py-3 px-2 font-bold text-center whitespace-nowrap">Perubahan</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">UoM</th>
                  <th className="py-3 px-2 font-bold">Alasan</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 text-dark-700">
                {adjustments.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 print:hover:bg-transparent transition-colors">
                    <td className="py-3 px-2 font-mono whitespace-nowrap text-dark-500">{formatDateShort(item.created_at)}</td>
                    <td className="py-3 px-2 font-mono text-dark-500">{item.product_sku}</td>
                    <td className="py-3 px-2 font-medium">{item.product_name}</td>
                    <td className="py-3 px-2">{item.branch_name}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        item.type === 'tambah' ? "bg-success-100 text-success-700 print:border print:border-success-500" : "bg-danger-100 text-danger-700 print:border print:border-danger-500"
                      )}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">
                      <span className={item.type === 'tambah' ? 'text-success-600' : 'text-danger-600'}>
                        {item.type === 'tambah' ? '+' : '-'}{Math.abs(item.qty_change)}
                      </span>
                    </td>
                    <td className="py-3 px-2">{item.unit}</td>
                    <td className="py-3 px-2 max-w-[200px] truncate" title={item.reason}>{item.reason}</td>
                    <td className="py-3 px-2 text-dark-500">{item.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Parameter Modal (Hidden on Print) */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Parameter Laporan</h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-dark-200 px-6 pt-2">
              <div className="px-4 py-2 text-primary-600 font-semibold border-b-2 border-primary-600">Umum</div>
              <div className="px-4 py-2 text-dark-500 font-medium">Kolom</div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg text-dark-700 mb-4 border-b border-dark-200 pb-2">Tanggal</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Dari</label>
                    <div className="flex-1 relative">
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 bg-blue-50 text-blue-700 font-medium"
                      />
                      <Calendar className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">s/d</label>
                    <div className="flex-1 relative">
                      <input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Calendar className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg text-dark-700 mb-4 border-b border-dark-200 pb-2">Parameter Tambahan</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Gudang <span className="text-danger-500">*</span></label>
                    <div className="flex-1 relative">
                      <select 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                      >
                        <option value="all">[Semua Gudang]</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-dark-200 flex justify-end">
              <button 
                onClick={applyFilter}
                disabled={!fromDate || !toDate}
                className="bg-[#1a365d] hover:bg-[#12284c] text-white px-6 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
              >
                Tampilkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
