'use client'

import { useState } from 'react'
import { Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface FinancialSummaryClientProps {
  transactions: any[]
  debtPayments: any[]
  branches: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function FinancialSummaryClient({
  transactions,
  debtPayments,
  branches,
  initialFrom,
  initialTo,
  initialBranch
}: FinancialSummaryClientProps) {
  const router = useRouter()
  
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formattedFrom = initialFrom ? new Date(initialFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const formattedTo = initialTo ? new Date(initialTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  const displayBranch = initialBranch === 'all' || !initialBranch 
    ? '[Semua Cabang]' 
    : branches.find(b => b.id === initialBranch)?.name || '[Semua Cabang]'

  const applyFilter = () => {
    setShowModal(false)
    let url = `/reports/financial-summary?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Calculate totals
  const totalCashSales = transactions.filter(t => t.payment_method === 'tunai').reduce((sum, t) => sum + Number(t.amount_paid || 0), 0)
  const totalTransferSales = transactions.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + Number(t.amount_paid || 0), 0)
  const totalQrisSales = transactions.filter(t => t.payment_method === 'qris').reduce((sum, t) => sum + Number(t.amount_paid || 0), 0)
  
  const totalCashDebt = debtPayments.filter(t => t.payment_method === 'tunai').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const totalTransferDebt = debtPayments.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const totalQrisDebt = debtPayments.filter(t => t.payment_method === 'qris').reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const totalCash = totalCashSales + totalCashDebt
  const totalTransfer = totalTransferSales + totalTransferDebt
  const totalQris = totalQrisSales + totalQrisDebt

  const totalAll = totalCash + totalTransfer + totalQris

  const exportToCSV = () => {
    const headers = ['Kategori', 'Metode Pembayaran', 'Sumber', 'Nominal']
    const csvData = [
      ['Penerimaan', 'Tunai', 'Penjualan', totalCashSales],
      ['Penerimaan', 'Tunai', 'Pelunasan Piutang', totalCashDebt],
      ['Penerimaan', 'Transfer', 'Penjualan', totalTransferSales],
      ['Penerimaan', 'Transfer', 'Pelunasan Piutang', totalTransferDebt],
      ['Penerimaan', 'QRIS', 'Penjualan', totalQrisSales],
      ['Penerimaan', 'QRIS', 'Pelunasan Piutang', totalQrisDebt],
    ]
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
      `"","","TOTAL KESELURUHAN","${totalAll}"`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Ringkasan_Keuangan_${initialFrom}_${initialTo}.csv`)
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
          @page { size: portrait; margin: 10mm; }
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
      <div className="bg-white shadow-xl max-w-[800px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-0">
        
        {/* Header Document */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">SBR FROZEN</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Financial Summary (Penerimaan)</h1>
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
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-t-2 border-b-2 border-dark-900 text-dark-900">
                  <th className="py-3 px-2 font-bold">Keterangan</th>
                  <th className="py-3 px-2 font-bold text-right w-48">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 text-dark-700">
                {/* TUNAI */}
                <tr className="bg-slate-50 font-semibold text-dark-900 print:bg-transparent">
                  <td colSpan={2} className="py-3 px-2 uppercase tracking-wide">Penerimaan Tunai (Cash)</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Penjualan Kasir</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalCashSales).replace('Rp', '')}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Pelunasan Piutang</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalCashDebt).replace('Rp', '')}</td>
                </tr>
                <tr className="font-bold text-dark-900 bg-blue-50/50 print:bg-transparent">
                  <td className="py-3 px-2 pl-8 text-right">Subtotal Tunai</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalCash).replace('Rp', '')}</td>
                </tr>

                {/* TRANSFER */}
                <tr className="bg-slate-50 font-semibold text-dark-900 print:bg-transparent">
                  <td colSpan={2} className="py-3 px-2 uppercase tracking-wide mt-4">Penerimaan Transfer Bank</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Penjualan Kasir</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalTransferSales).replace('Rp', '')}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Pelunasan Piutang</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalTransferDebt).replace('Rp', '')}</td>
                </tr>
                <tr className="font-bold text-dark-900 bg-blue-50/50 print:bg-transparent">
                  <td className="py-3 px-2 pl-8 text-right">Subtotal Transfer</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalTransfer).replace('Rp', '')}</td>
                </tr>

                {/* QRIS */}
                <tr className="bg-slate-50 font-semibold text-dark-900 print:bg-transparent">
                  <td colSpan={2} className="py-3 px-2 uppercase tracking-wide mt-4">Penerimaan QRIS</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Penjualan Kasir</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalQrisSales).replace('Rp', '')}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 pl-8">Dari Pelunasan Piutang</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalQrisDebt).replace('Rp', '')}</td>
                </tr>
                <tr className="font-bold text-dark-900 bg-blue-50/50 print:bg-transparent">
                  <td className="py-3 px-2 pl-8 text-right">Subtotal QRIS</td>
                  <td className="py-3 px-2 text-right">{formatRupiah(totalQris).replace('Rp', '')}</td>
                </tr>

              </tbody>
              <tfoot>
                <tr className="border-t-4 border-double border-dark-900 font-black text-lg text-[#800000]">
                  <td className="py-4 px-2 text-right uppercase">Total Penerimaan</td>
                  <td className="py-4 px-2 text-right">{formatRupiah(totalAll).replace('Rp', '')}</td>
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
            <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Parameter Laporan</h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-dark-200 px-6 pt-2">
              <div className="px-4 py-2 text-primary-600 font-semibold border-b-2 border-primary-600">Umum</div>
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
