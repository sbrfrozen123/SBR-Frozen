'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Download, Printer, Filter, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ShiftSalesClientProps {
  userRole: string
}

export default function ShiftSalesClient({ userRole }: ShiftSalesClientProps) {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [users, setUsers] = useState<{id: string, full_name: string}[]>([])
  const [selectedKasir, setSelectedKasir] = useState<string>('')
  const supabase = createClient()

  const today = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchShifts()
  }, [fromDate, toDate])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'kasir')
    if (data) setUsers(data)
  }

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
      if (selectedKasir) query.eq('user_id', selectedKasir)

      const { data, error } = await query.order('start_time', { ascending: false })

      if (error) throw error
      
      // Auto-fetch items for all shifts to populate the column
      const shiftsData = data || []
      
      // We will load items individually for all shifts here so it can be printed in a column
      const shiftsWithItems = await Promise.all(shiftsData.map(async (shift) => {
        const endTime = shift.end_time || new Date().toISOString()
        const { data: txns } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [] }
        
        const txnIds = txns.map(t => t.id)
        const { data: items } = await supabase
          .from('transaction_items')
          .select('product_name, qty, subtotal')
          .in('transaction_id', txnIds)
          
        const aggregated = (items || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.product_name]) {
            acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
          }
          acc[curr.product_name].qty += curr.qty
          acc[curr.product_name].subtotal += curr.subtotal
          return acc
        }, {})
        
        return {
          ...shift,
          shiftItems: Object.values(aggregated).sort((a: any, b: any) => b.qty - a.qty)
        }
      }))
      
      setShifts(shiftsWithItems)
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
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col print:p-0 print:space-y-0">
      <div className="page-header flex-shrink-0 print:hidden">
        <div>
          <h1 className="page-title">Laporan Penjualan per Shift</h1>
          <p className="page-subtitle">Rincian pendapatan kasir per sesi shift.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <button onClick={handleExportCSV} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-md shadow-sm shadow-primary-500/20 whitespace-nowrap">
            <Printer className="w-4 h-4 mr-2" /> Cetak PDF
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
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        <div className="p-4 border-b border-dark-100 flex flex-wrap gap-4 bg-white flex-shrink-0 print:hidden">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari nama kasir..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={selectedKasir} onChange={e => setSelectedKasir(e.target.value)} className="input w-40 text-sm bg-white">
              <option value="">Semua Kasir</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input w-36 text-sm" />
            <span className="text-dark-400">-</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input w-36 text-sm" />
            <button onClick={fetchShifts} className="btn-md btn-primary px-3"><Filter className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white print:overflow-visible print:p-0">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-dark-900 pb-6 pt-4">
            <h1 className="text-2xl font-black text-dark-900 uppercase tracking-wider mb-2">LAPORAN RIWAYAT SHIFT KASIR</h1>
            <h2 className="text-lg font-bold text-dark-700">SBR FROZEN POS</h2>
            <p className="text-dark-500 mt-2 text-sm font-medium">Dicetak pada: {today}</p>
          </div>
          <table className="data-table-dense w-full">
            <thead className="sticky top-0 z-10 bg-dark-50">
              <tr>
                <th className="w-12 text-center border-l-0 print:border-l">No</th>
                <th>Waktu Mulai</th>
                <th>Waktu Selesai</th>
                <th>Kasir</th>
                <th>Barang Terjual</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Kas Sistem</th>
                <th className="text-right">Kas Fisik</th>
                <th className="text-right">Selisih</th>
                <th className="text-center border-r-0 print:border-r">Status</th>
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
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="text-center text-dark-400 border-l-0 print:border-l">{index + 1}</td>
                      <td>{format(new Date(s.start_time), 'dd MMM yyyy, HH:mm', { locale: id })}</td>
                    <td>{s.end_time ? format(new Date(s.end_time), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}</td>
                    <td className="font-semibold text-dark-700">{s.kasir?.full_name}</td>
                    <td className="min-w-[250px]">
                      {s.shiftItems && s.shiftItems.length > 0 ? (
                        <div className="flex flex-col gap-1 max-w-[280px]">
                          {s.shiftItems.map((item: any, i: number) => (
                            <div key={i} className="text-xs flex justify-between gap-2 border-b border-dark-50 pb-1 last:border-0 last:pb-0">
                              <span className="truncate" title={item.name}>{item.name}</span>
                              <span className="font-semibold whitespace-nowrap">{item.qty} pcs</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-dark-400">Belum ada penjualan</span>
                      )}
                    </td>
                    <td className="text-right text-dark-600 font-mono text-sm">{formatRupiah(s.starting_cash)}</td>
                    <td className="text-right font-bold text-dark-900 font-mono text-sm">{formatRupiah(s.expected_ending_cash || s.starting_cash)}</td>
                    <td className="text-right font-bold text-primary-700 font-mono text-sm">{s.actual_ending_cash ? formatRupiah(s.actual_ending_cash) : '-'}</td>
                    <td className="text-right">
                      {s.actual_ending_cash !== undefined && s.actual_ending_cash !== null ? (
                        <span className={s.actual_ending_cash - (s.expected_ending_cash || 0) < 0 ? 'text-danger font-bold' : s.actual_ending_cash - (s.expected_ending_cash || 0) > 0 ? 'text-success font-bold' : 'text-dark-400'}>
                          {formatRupiah(s.actual_ending_cash - (s.expected_ending_cash || 0))}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="text-center border-r-0 print:border-r">
                      <span className={cn(
                        "badge",
                        s.status === 'closed' ? 'badge-gray' : 'badge-success'
                      )}>
                        {s.status === 'closed' ? 'Selesai' : 'Aktif'}
                      </span>
                    </td>
                  </tr>
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
