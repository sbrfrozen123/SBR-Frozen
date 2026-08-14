'use client'

import { useState, useMemo } from 'react'
import { Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface ProfitLossClientProps {
  transactions: any[]
  transactionItems: any[]
  expenses: any[]
  branches: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function ProfitLossClient({
  transactions,
  transactionItems,
  expenses,
  branches,
  initialFrom,
  initialTo,
  initialBranch
}: ProfitLossClientProps) {
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
    let url = `/reports/profit-loss?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const { totalRevenue, totalCogs, totalExpenses, expenseByCategory } = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0)
    const totalCogs = transactionItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.products?.hpp || 0)), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    const expenseByCategory: Record<string, number> = {}
    expenses.forEach(e => {
      const cat = e.category || 'Lain-lain'
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount)
    })

    return { totalRevenue, totalCogs, totalExpenses, expenseByCategory }
  }, [transactions, transactionItems, expenses])

  const grossProfit = totalRevenue - totalCogs
  const netProfit = grossProfit - totalExpenses

  const exportToCSV = () => {
    // Generate CSV for Profit Loss
    const rows = [
      ['Keterangan', 'Nilai (Rp)'],
      ['PENDAPATAN', ''],
      ['Pendapatan Penjualan', totalRevenue],
      ['TOTAL PENDAPATAN', totalRevenue],
      ['', ''],
      ['HARGA POKOK PENJUALAN (HPP)', ''],
      ['HPP Barang Terjual', totalCogs],
      ['TOTAL HPP', totalCogs],
      ['', ''],
      ['LABA KOTOR', grossProfit],
      ['', ''],
      ['BEBAN OPERASIONAL', '']
    ]

    if (Object.keys(expenseByCategory).length === 0) {
      rows.push(['Tidak ada pengeluaran', 0])
    } else {
      Object.entries(expenseByCategory).forEach(([cat, val]) => {
        rows.push([`Beban ${cat}`, val])
      })
    }
    
    rows.push(['TOTAL BEBAN OPERASIONAL', totalExpenses])
    rows.push(['', ''])
    rows.push(['LABA BERSIH (NET PROFIT)', netProfit])

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Laba_Rugi_${initialFrom}_${initialTo}.csv`)
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
      <div className="bg-white shadow-xl max-w-[900px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-0">
        
        {/* Header Document */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">SBR FROZEN</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Laporan Laba Rugi</h1>
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
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-dark-900">
                  <th className="pb-3 font-bold text-dark-900 uppercase">Keterangan</th>
                  <th className="pb-3 font-bold text-dark-900 uppercase text-right w-48">Nilai (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {/* PENDAPATAN */}
                <tr>
                  <td colSpan={2} className="pt-6 pb-2 font-bold text-dark-900 text-base">
                    PENDAPATAN
                  </td>
                </tr>
                <tr className="border-b border-dark-100 border-dotted">
                  <td className="py-3 pl-6 text-dark-700">Pendapatan Penjualan</td>
                  <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(totalRevenue).replace('Rp', '')}</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-dark-900">TOTAL PENDAPATAN</td>
                  <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalRevenue).replace('Rp', '')}</td>
                </tr>

                {/* HARGA POKOK PENJUALAN */}
                <tr>
                  <td colSpan={2} className="pt-8 pb-2 font-bold text-dark-900 text-base">
                    HARGA POKOK PENJUALAN (HPP)
                  </td>
                </tr>
                <tr className="border-b border-dark-100 border-dotted">
                  <td className="py-3 pl-6 text-dark-700">HPP Barang Terjual</td>
                  <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(totalCogs).replace('Rp', '')}</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-dark-900">TOTAL HPP</td>
                  <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalCogs).replace('Rp', '')}</td>
                </tr>

                {/* LABA KOTOR */}
                <tr className="bg-primary-50/50 print:bg-transparent">
                  <td className="py-4 mt-4 font-bold text-primary-900 text-base print:text-dark-900 print:border-t-2 print:border-b-2 print:border-dark-900">
                    LABA KOTOR
                  </td>
                  <td className="py-4 mt-4 text-right font-bold text-primary-900 text-base print:text-dark-900 print:border-t-2 print:border-b-2 print:border-dark-900">
                    {formatRupiah(grossProfit).replace('Rp', '')}
                  </td>
                </tr>

                {/* BEBAN OPERASIONAL */}
                <tr>
                  <td colSpan={2} className="pt-8 pb-2 font-bold text-dark-900 text-base">
                    BEBAN OPERASIONAL
                  </td>
                </tr>
                {Object.keys(expenseByCategory).length === 0 ? (
                  <tr className="border-b border-dark-100 border-dotted">
                    <td className="py-3 pl-6 text-dark-400 italic">Tidak ada pengeluaran</td>
                    <td className="py-3 text-right text-dark-400">0</td>
                  </tr>
                ) : (
                  Object.entries(expenseByCategory).map(([cat, val]) => (
                    <tr key={cat} className="border-b border-dark-100 border-dotted">
                      <td className="py-3 pl-6 text-dark-700 capitalize">Beban {cat}</td>
                      <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(val as number).replace('Rp', '')}</td>
                    </tr>
                  ))
                )}
                <tr>
                  <td className="py-3 font-bold text-dark-900">TOTAL BEBAN OPERASIONAL</td>
                  <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalExpenses).replace('Rp', '')}</td>
                </tr>

                {/* LABA BERSIH */}
                <tr className={cn(
                  "print:bg-transparent",
                  netProfit >= 0 ? "bg-emerald-50/50" : "bg-danger-50/50"
                )}>
                  <td className={cn(
                    "py-5 mt-4 font-black text-lg print:text-dark-900 print:border-t-[3px] print:border-b-[3px] print:border-dark-900",
                    netProfit >= 0 ? "text-emerald-700" : "text-danger-700"
                  )}>
                    LABA BERSIH (NET PROFIT)
                  </td>
                  <td className={cn(
                    "py-5 mt-4 text-right font-black text-xl print:text-dark-900 print:border-t-[3px] print:border-b-[3px] print:border-dark-900",
                    netProfit >= 0 ? "text-emerald-700" : "text-danger-700"
                  )}>
                    {formatRupiah(netProfit).replace('Rp', '')}
                  </td>
                </tr>

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
              <button onClick={() => initialFrom ? setShowModal(false) : null} className="text-white/70 hover:text-white transition-colors">
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
