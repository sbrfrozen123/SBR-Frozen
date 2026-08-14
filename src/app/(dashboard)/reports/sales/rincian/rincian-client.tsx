'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, User, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface RincianClientProps {
  salesData: any[]
  branches: any[]
  profiles: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
  initialSalesman: string
}

export default function RincianClient({
  salesData,
  branches,
  profiles,
  initialFrom,
  initialTo,
  initialBranch,
  initialSalesman
}: RincianClientProps) {
  const router = useRouter()
  
  // Parameter State
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  const [salesman, setSalesman] = useState(initialSalesman)
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Format Dates for display in the report header
  const formattedFrom = initialFrom ? new Date(initialFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const formattedTo = initialTo ? new Date(initialTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  // Format Branch Name for display
  const displayBranch = initialBranch === 'all' || !initialBranch 
    ? '[Semua Cabang]' 
    : branches.find(b => b.id === initialBranch)?.name || '[Semua Cabang]'

  const applyFilter = () => {
    setShowModal(false)
    let url = `/reports/sales/rincian?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    if (salesman) url += `&salesman=${salesman}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const exportToCSV = () => {
    const headers = ['Nomor SO', 'Pelanggan', 'Nama Barang', 'Kuantitas', 'UoM', 'Salesman', 'Warehouse', 'Harga Jual', 'Penjualan', 'Payment Amount']
    const csvData = detailedItems.map(item => [
      item.invoice_number,
      item.customer_name,
      item.product_name,
      item.qty,
      item.unit,
      item.salesman,
      item.branch,
      item.unit_price,
      item.subtotal,
      item.payment_amount
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Rincian_Faktur_Penjualan_${initialFrom}_${initialTo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      <div className="bg-white shadow-xl max-w-[1400px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-0">
        
        {/* Header Document */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">PT INDUSTRI KELUARGA TIMUR</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Rincian Faktur Penjualan</h1>
          <p className="text-sm text-dark-700 mt-1">
            Dari {formattedFrom || '-'} s/d {formattedTo || '-'}
          </p>
        </div>

        {/* Info Right */}
        <div className="flex justify-end mb-4">
          <p className="text-xs italic text-dark-600">Cabang : {displayBranch}</p>
        </div>

        {/* Data Table */}
        <div className="w-full">
          {(!initialFrom || !initialTo) ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Silakan atur Parameter Laporan terlebih dahulu untuk menampilkan data.
            </div>
          ) : detailedItems.length === 0 ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Tidak ada data penjualan pada rentang tanggal dan parameter ini.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-t-2 border-b-2 border-dark-900 text-dark-900">
                  <th className="py-3 px-2 font-bold whitespace-nowrap">Nomor SO</th>
                  <th className="py-3 px-2 font-bold">Pelanggan</th>
                  <th className="py-3 px-2 font-bold">Nama Barang</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Kuantitas</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">UoM</th>
                  <th className="py-3 px-2 font-bold">Salesman</th>
                  <th className="py-3 px-2 font-bold">Warehouse</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Harga Jual</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Penjualan</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Payment<br/>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 text-dark-700">
                {detailedItems.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 print:hover:bg-transparent transition-colors">
                    <td className="py-3 px-2 align-top">{item.invoice_number}</td>
                    <td className="py-3 px-2 align-top">{item.customer_name}</td>
                    <td className="py-3 px-2 align-top">{item.product_name}</td>
                    <td className="py-3 px-2 align-top text-right">{item.qty}</td>
                    <td className="py-3 px-2 align-top">{item.unit}</td>
                    <td className="py-3 px-2 align-top">{item.salesman}</td>
                    <td className="py-3 px-2 align-top">{item.branch}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.unit_price).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right font-semibold">{formatRupiah(item.subtotal).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.payment_amount).replace('Rp', '')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-b-2 border-dark-900 font-bold text-dark-900">
                  <td colSpan={8} className="py-3 px-2 text-right">TOTAL</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(detailedItems.reduce((sum, item) => sum + item.subtotal, 0)).replace('Rp', '')}</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(detailedItems.reduce((sum, item) => sum + item.payment_amount, 0)).replace('Rp', '')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Parameter Modal (Hidden on Print) */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Parameter Laporan</h3>
              <button onClick={() => initialFrom ? setShowModal(false) : null} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Tabs */}
            <div className="flex border-b border-dark-200 px-6 pt-2">
              <div className="px-4 py-2 text-primary-600 font-semibold border-b-2 border-danger-500">Umum</div>
              <div className="px-4 py-2 text-dark-500 font-medium">Kolom</div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Tanggal Section */}
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
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 bg-blue-50 text-blue-700 selection:bg-blue-200 font-medium"
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

              {/* Parameter Tambahan Section */}
              <div>
                <h4 className="text-lg text-dark-700 mb-4 border-b border-dark-200 pb-2">Parameter Tambahan</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Cabang <span className="text-danger-500">*</span></label>
                    <div className="flex-1 relative">
                      <select 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                      >
                        <option value="all">[Semua Cabang]</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Salesman</label>
                    <div className="flex-1 relative">
                      <select 
                        value={salesman}
                        onChange={(e) => setSalesman(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                      >
                        <option value="all">[Semua Salesman]</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                      </select>
                      <User className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
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
