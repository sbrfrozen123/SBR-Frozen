'use client'

import { useState, useEffect } from 'react'
import { Printer, Download, RefreshCw, X, Calendar, MapPin, Truck, ChevronLeft, Filter } from 'lucide-react'
import { formatDateShort, formatDateFull } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TransfersReportClientProps {
  initialTransfers: any[]
  branches: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function TransfersReportClient({ initialTransfers, branches, initialFrom, initialTo, initialBranch }: TransfersReportClientProps) {
  const [transfers, setTransfers] = useState(initialTransfers)
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  
  // Filter state
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const applyFilter = async () => {
    if (!fromDate || !toDate) return toast.error('Pilih rentang tanggal terlebih dahulu')
    setLoading(true)
    
    try {
      let query = supabase.from('stock_transfers')
        .select(`*, from_wh:warehouses!from_warehouse_id(name), to_wh:warehouses!to_warehouse_id(name), creator:profiles!stock_transfers_user_id_fkey(full_name), receiver:profiles!stock_transfers_received_by_fkey(full_name), items:stock_transfer_items(*, products(name, sku, unit))`)
        .gte('transfer_date', fromDate + 'T00:00:00')
        .lte('transfer_date', toDate + 'T23:59:59')
        .order('transfer_date', { ascending: false })

      if (branch !== 'all') {
        const { data: whData } = await supabase.from('warehouses').select('id').eq('branch_id', branch)
        if (whData && whData.length > 0) {
          const whIds = whData.map(w => w.id)
          query = query.or(`from_warehouse_id.in.(${whIds.join(',')}),to_warehouse_id.in.(${whIds.join(',')})`)
        }
      }

      const { data, error } = await query
      if (error) throw error
      setTransfers(data || [])
      setShowModal(false)
      
      // Update URL silently
      const url = new URL(window.location.href)
      url.searchParams.set('from', fromDate)
      url.searchParams.set('to', toDate)
      url.searchParams.set('branch', branch)
      window.history.replaceState({}, '', url.toString())
      
    } catch (err: any) {
      toast.error('Gagal mengambil data laporan')
    } finally {
      setLoading(false)
    }
  }

  const formattedFrom = fromDate ? formatDateShort(fromDate) : ''
  const formattedTo = toDate ? formatDateShort(toDate) : ''
  const displayBranch = branch === 'all' ? '[Semua Cabang]' : branches.find(b => b.id === branch)?.name || '[Semua Cabang]'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 relative font-sans">
      {/* Top Action Bar */}
      <div className="w-full max-w-[1200px] mx-4 mb-4 flex justify-between items-end print-hidden">
        <Link href="/reports" className="btn-md bg-white border border-dark-200 text-dark-600 hover:bg-dark-50 shadow-sm flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
        <div className="flex bg-white rounded-lg p-1.5 shadow-sm border border-dark-200 gap-1">
          <button onClick={() => setShowModal(true)} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group px-3 py-1">
            <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Parameter</span>
          </button>
          <button onClick={applyFilter} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group px-3 py-1">
            <RefreshCw className={cn("w-5 h-5 group-hover:scale-110 transition-transform", loading && "animate-spin")} />
            <span className="text-[10px] font-bold mt-1">Refresh</span>
          </button>
          <button className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group px-3 py-1">
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Export</span>
          </button>
          <button onClick={() => window.print()} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group px-3 py-1">
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
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Laporan Transfer Barang</h1>
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
          ) : transfers.length === 0 ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Tidak ada data transfer pada rentang tanggal ini.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-t-2 border-b-2 border-dark-900 text-dark-900">
                  <th className="py-3 px-2 font-bold whitespace-nowrap">Tanggal</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">No Referensi</th>
                  <th className="py-3 px-2 font-bold">Asal</th>
                  <th className="py-3 px-2 font-bold">Tujuan</th>
                  <th className="py-3 px-2 font-bold">Barang Dikirim</th>
                  <th className="py-3 px-2 font-bold text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 text-dark-700">
                {transfers.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 print:hover:bg-transparent transition-colors align-top">
                    <td className="py-3 px-2 font-mono whitespace-nowrap text-dark-500">{formatDateShort(item.transfer_date)}</td>
                    <td className="py-3 px-2 font-mono text-dark-800 font-bold">{item.reference_number}</td>
                    <td className="py-3 px-2 text-danger-700 font-medium">{item.from_wh?.name}</td>
                    <td className="py-3 px-2 text-success-700 font-medium">{item.to_wh?.name}</td>
                    <td className="py-3 px-2">
                      <ul className="list-disc pl-4 space-y-1">
                        {item.items?.map((detail: any, dIdx: number) => (
                          <li key={dIdx}>
                            <span className="font-medium text-dark-900">{detail.products?.name}</span> <span className="text-dark-500">({detail.qty_sent} {detail.products?.unit || 'pcs'})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        item.status === 'completed' ? "bg-success-100 text-success-700" : 
                        item.status === 'in_transit' ? "bg-warning-100 text-warning-700" : "bg-dark-100 text-dark-700"
                      )}>
                        {item.status === 'completed' ? 'Selesai' : item.status === 'in_transit' ? 'Dikirim' : item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-dark-500">{item.creator?.full_name || '-'}</td>
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
                    <label className="w-16 text-sm text-dark-700">Cabang</label>
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

              <div className="pt-4">
                <button 
                  onClick={applyFilter}
                  disabled={loading}
                  className="w-full btn-md bg-primary-600 hover:bg-primary-700 text-white font-bold"
                >
                  {loading ? 'Memproses...' : 'Tampilkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
