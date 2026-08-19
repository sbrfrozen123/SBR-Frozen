'use client'

import React, { useState, useEffect } from 'react'
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
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [expandedShift, setExpandedShift] = useState<string | null>(null)
  const [shiftItems, setShiftItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchShifts()
  }, [fromDate, toDate])

  const fetchShifts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('cashier_shifts')
        .select(`
          *,
          kasir:profiles!cashier_shifts_user_id_fkey(full_name),
          branch:branches(name)
        `)
        
      if (fromDate) query.gte('start_time', `${fromDate}T00:00:00.000Z`)
      if (toDate) query.lte('start_time', `${toDate}T23:59:59.999Z`)

      const { data, error } = await query.order('start_time', { ascending: false })

      if (error) throw error
      setShifts(data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadShiftItems = async (shift: any) => {
    if (expandedShift === shift.id) {
      setExpandedShift(null)
      return
    }
    setExpandedShift(shift.id)
    setLoadingItems(true)
    setShiftItems([])

    try {
      const endTime = shift.end_time || new Date().toISOString()
      const { data: txns, error: txnsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', shift.user_id)
        .gte('created_at', shift.start_time)
        .lte('created_at', endTime)
        .eq('order_status', 'completed')

      if (txnsError) throw txnsError
      if (!txns || txns.length === 0) {
        setShiftItems([])
        return
      }

      const txnIds = txns.map(t => t.id)
      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select('product_name, qty, subtotal')
        .in('transaction_id', txnIds)

      if (itemsError) throw itemsError

      // Aggregate items by product_name
      const aggregated = (items || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.product_name]) {
          acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
        }
        acc[curr.product_name].qty += curr.qty
        acc[curr.product_name].subtotal += curr.subtotal
        return acc
      }, {})

      setShiftItems(Object.values(aggregated).sort((a: any, b: any) => b.qty - a.qty))

    } catch (err) {
      console.error(err)
    } finally {
      setLoadingItems(false)
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
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input w-36 text-sm" />
            <span className="text-dark-400">-</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input w-36 text-sm" />
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
                  <React.Fragment key={s.id}>
                    <tr onClick={() => loadShiftItems(s)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="text-center text-dark-400 border-l-0">
                        <ChevronRight className={cn("w-4 h-4 mx-auto transition-transform", expandedShift === s.id && "rotate-90")} />
                      </td>
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
                  {expandedShift === s.id && (
                    <tr className="bg-slate-50 border-b border-dark-100">
                      <td colSpan={11} className="p-4 border-l-0 border-r-0">
                        <div className="bg-white rounded-xl border border-dark-100 p-4 shadow-sm">
                          <h4 className="text-sm font-bold text-dark-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Rincian Barang Terjual
                          </h4>
                          {loadingItems ? (
                            <p className="text-sm text-dark-400">Memuat rincian...</p>
                          ) : shiftItems.length === 0 ? (
                            <p className="text-sm text-dark-400">Tidak ada barang terjual pada shift ini.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {shiftItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded-lg border border-dark-50 bg-slate-50/50">
                                  <div className="truncate pr-2">
                                    <p className="text-sm font-semibold text-dark-900 truncate" title={item.name}>{item.name}</p>
                                    <p className="text-xs text-dark-500">{item.qty} item</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-primary-700">{formatRupiah(item.subtotal)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
