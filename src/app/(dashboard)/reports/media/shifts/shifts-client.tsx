'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils/currency'
import { Printer, Download, ChevronLeft, Clock, Filter, Search, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ShiftsMediaClientProps {
  shifts: any[]
  branches: { id: string; name: string }[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function ShiftsMediaClient({ shifts, branches, initialFrom, initialTo, initialBranch }: ShiftsMediaClientProps) {
  const router = useRouter()
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  
  const [showFilter, setShowFilter] = useState(false)
  const [fromDate, setFromDate] = useState(initialFrom || new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(initialTo || new Date().toISOString().split('T')[0])
  const [selectedBranch, setSelectedBranch] = useState(initialBranch || 'all')

  const applyFilter = () => {
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (selectedBranch) params.set('branch', selectedBranch)
    router.push(`/reports/media/shifts?${params.toString()}`)
    setShowFilter(false)
  }

  const exportToCSV = () => {
    const rows = [
      ['No', 'Nama Kasir', 'Waktu Buka', 'Waktu Tutup', 'Status', 'Saldo Awal', 'Sistem', 'Aktual', 'Selisih']
    ]

    shifts.forEach((s, index) => {
      rows.push([
        (index + 1).toString(),
        `"${s.profiles?.full_name || 'Tidak Diketahui'}"`,
        `"${new Date(s.start_time).toLocaleString('id-ID')}"`,
        s.end_time ? `"${new Date(s.end_time).toLocaleString('id-ID')}"` : 'Belum Tutup',
        s.status,
        s.starting_cash.toString(),
        s.expected_cash.toString(),
        (s.actual_cash || 0).toString(),
        (s.difference || 0).toString()
      ])
    })

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Rincian_Shift_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto w-full bg-slate-50 min-h-screen">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-dark-100 flex-shrink-0 print:hidden relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary-50/50 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/reports" className="btn btn-outline btn-md p-2 text-dark-600 hover:text-dark-900 border-dark-200">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary-600" />
              Rincian Shift Kerja
            </h1>
            <p className="text-sm text-dark-500 mt-1 font-medium">Histori jam kerja kasir dan laporan saldo penutup.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <button onClick={() => setShowFilter(true)} className="btn btn-outline btn-md text-dark-600 border-dark-200 hover:bg-dark-50 flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Filter Data
          </button>
          <button onClick={exportToCSV} className="btn btn-outline btn-md text-dark-600 border-dark-200 hover:bg-dark-50 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-md shadow-sm shadow-primary-500/20 flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          @page { size: landscape; margin: 15mm; }
        }
      `}} />

      {/* Document Paper */}
      <div className="flex-1 overflow-auto print:overflow-visible">
        {(!initialFrom || !initialTo) ? (
          <div className="bg-white border border-dark-100 rounded-2xl shadow-sm p-12 text-center print:hidden">
            <Calendar className="w-16 h-16 text-dark-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark-900 mb-2">Pilih Rentang Waktu</h2>
            <p className="text-dark-500 mb-6">Silakan filter rentang tanggal laporan untuk menampilkan data rincian shift kerja.</p>
            <button onClick={() => setShowFilter(true)} className="btn btn-primary btn-md mx-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-white border border-dark-100 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
            <div className="p-8 sm:p-12 print:p-0">
              {/* Header Laporan */}
              <div className="text-center mb-8 border-b-2 border-dark-900 pb-6">
                <h1 className="text-2xl font-black text-dark-900 uppercase tracking-wider mb-2">RINCIAN SHIFT KERJA KASIR</h1>
                <h2 className="text-lg font-bold text-dark-700">SBR FROZEN POS</h2>
                <p className="text-dark-600 mt-2">Periode: {new Date(initialFrom).toLocaleDateString('id-ID')} - {new Date(initialTo).toLocaleDateString('id-ID')}</p>
                <p className="text-dark-500 mt-1 text-sm font-medium">Dicetak pada: {today} | Total: {shifts.length} Shift</p>
              </div>

              {/* Table */}
              <div className="mb-8">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-dark-300 bg-dark-50/50 print:bg-transparent">
                      <th className="py-3 px-2 font-bold text-dark-900 w-12 text-center">No</th>
                      <th className="py-3 px-2 font-bold text-dark-900">Kasir</th>
                      <th className="py-3 px-2 font-bold text-dark-900">Waktu Buka</th>
                      <th className="py-3 px-2 font-bold text-dark-900">Waktu Tutup</th>
                      <th className="py-3 px-2 font-bold text-dark-900 text-center">Status</th>
                      <th className="py-3 px-2 font-bold text-dark-900 text-right">Saldo Awal</th>
                      <th className="py-3 px-2 font-bold text-dark-900 text-right">Sistem</th>
                      <th className="py-3 px-2 font-bold text-dark-900 text-right">Aktual</th>
                      <th className="py-3 px-2 font-bold text-dark-900 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {shifts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-dark-500 italic">Tidak ada data shift pada periode ini.</td>
                      </tr>
                    ) : (
                      shifts.map((s, index) => (
                        <tr key={index} className="hover:bg-dark-50/50 print:hover:bg-transparent transition-colors">
                          <td className="py-3 px-2 text-center text-dark-500">{index + 1}</td>
                          <td className="py-3 px-2 font-bold text-dark-900">
                            {s.profiles?.full_name || 'Tidak Diketahui'}
                          </td>
                          <td className="py-3 px-2 text-dark-700 whitespace-nowrap">
                            {new Date(s.start_time).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-2 text-dark-700 whitespace-nowrap">
                            {s.end_time ? new Date(s.end_time).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {s.status === 'open' ? (
                              <span className="text-xs text-primary-600 font-medium">Buka</span>
                            ) : (
                              <span className="text-xs text-dark-500">Tutup</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-dark-700">
                            {formatRupiah(s.starting_cash)}
                          </td>
                          <td className="py-3 px-2 text-right text-dark-900">
                            {formatRupiah(s.expected_cash)}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-dark-900">
                            {s.actual_cash ? formatRupiah(s.actual_cash) : '-'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {s.difference !== null ? (
                              <span className={s.difference < 0 ? 'text-danger font-bold' : s.difference > 0 ? 'text-success font-bold' : 'text-dark-500'}>
                                {formatRupiah(s.difference)}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <h2 className="text-lg font-bold text-dark-900">Filter Laporan</h2>
              <button 
                onClick={() => setShowFilter(false)}
                className="btn btn-outline btn-md border-none text-dark-400 hover:text-dark-900 hover:bg-dark-50"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  className="input w-full" 
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  className="input w-full" 
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
              {branches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Cabang</label>
                  <select 
                    className="input w-full"
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">Semua Cabang</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowFilter(false)}
                className="btn btn-outline btn-md"
              >
                Batal
              </button>
              <button 
                onClick={applyFilter}
                className="btn btn-primary btn-md min-w-[120px]"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
