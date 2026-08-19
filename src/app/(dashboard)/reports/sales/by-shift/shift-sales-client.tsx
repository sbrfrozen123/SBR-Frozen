'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Download, Printer, Filter, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'

interface ShiftSalesClientProps {
  userRole: string
}

export default function ShiftSalesClient({ userRole }: ShiftSalesClientProps) {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cashier_shifts')
        .select(`
          *,
          kasir:profiles!cashier_shifts_user_id_fkey(full_name),
          branch:branches(name)
        `)
        .order('start_time', { ascending: false })

      if (error) throw error
      setShifts(data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
  }

  const filteredShifts = shifts.filter(s => 
    s.kasir?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportCSV = () => {
    // ...
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Laporan Penjualan per Shift</h1>
          <p className="page-subtitle">Rincian pendapatan kasir per sesi shift.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <button onClick={handleExportCSV} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => window.print()} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 flex gap-4 bg-white flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari nama kasir..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table-dense w-full">
            <thead className="sticky top-0 z-10 bg-dark-50">
              <tr>
                <th className="w-12 text-center border-l-0">No</th>
                <th>Waktu Mulai</th>
                <th>Waktu Selesai</th>
                <th>Kasir</th>
                <th>Cabang</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Total Transaksi</th>
                <th className="text-right">Kas Sistem</th>
                <th className="text-right">Kas Fisik</th>
                <th className="text-right">Selisih</th>
                <th className="text-center border-r-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-dark-400">Loading...</td>
                </tr>
              ) : filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-dark-400">
                    <Clock className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada data shift</p>
                  </td>
                </tr>
              ) : (
                filteredShifts.map((s, index) => (
                  <tr key={s.id}>
                    <td className="text-center text-dark-400 border-l-0">{index + 1}</td>
                    <td>{format(new Date(s.start_time), 'dd MMM yyyy, HH:mm', { locale: id })}</td>
                    <td>{s.end_time ? format(new Date(s.end_time), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}</td>
                    <td className="font-semibold text-dark-700">{s.kasir?.full_name}</td>
                    <td>{s.branch?.name || '-'}</td>
                    <td className="text-right text-dark-600">{formatRupiah(s.starting_cash)}</td>
                    <td className="text-right text-dark-600">{s.total_transactions || 0} Trx</td>
                    <td className="text-right font-bold text-dark-900">{formatRupiah(s.expected_ending_cash || s.starting_cash)}</td>
                    <td className="text-right font-bold text-primary-700">{s.actual_ending_cash ? formatRupiah(s.actual_ending_cash) : '-'}</td>
                    <td className="text-right">
                      {s.actual_ending_cash !== undefined && s.actual_ending_cash !== null ? (
                        <span className={s.actual_ending_cash - (s.expected_ending_cash || 0) < 0 ? 'text-danger font-bold' : s.actual_ending_cash - (s.expected_ending_cash || 0) > 0 ? 'text-success font-bold' : 'text-dark-400'}>
                          {formatRupiah(s.actual_ending_cash - (s.expected_ending_cash || 0))}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="text-center border-r-0">
                      <span className={cn(
                        "badge",
                        s.status === 'closed' ? 'badge-gray' : 'badge-success'
                      )}>
                        {s.status === 'closed' ? 'Selesai' : 'Aktif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
