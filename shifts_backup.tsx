'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Search, Printer, Download } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { id as localeID } from 'date-fns/locale'

interface ShiftData {
  id: string
  start_time: string
  end_time: string | null
  starting_cash: number
  ending_cash_system: number | null
  ending_cash_actual: number | null
  status: string
  user_id: string
  user?: { full_name: string }
  shiftItems?: any[]
}

interface ShiftsClientProps {
  initialShifts: ShiftData[]
  userRole: UserRole
}

export default function ShiftsClient({ initialShifts, userRole }: ShiftsClientProps) {
  const [search, setSearch] = useState('')
  const [selectedKasir, setSelectedKasir] = useState('')
  const [shifts, setShifts] = useState<ShiftData[]>(initialShifts)
  const supabase = createClient()

  useEffect(() => {
    const fetchItems = async () => {
      const shiftsWithItems = await Promise.all(initialShifts.map(async (shift) => {
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
    }
    fetchItems()
  }, [initialShifts])

  // Get unique users for the filter dropdown
  const uniqueUsers = Array.from(new Map(initialShifts.filter(s => s.user).map(s => [s.user_id, { id: s.user_id, name: s.user?.full_name }])).values())

  const filteredShifts = shifts.filter(s => {
    const searchLower = search.toLowerCase()
    const matchesSearch = s.user?.full_name?.toLowerCase().includes(searchLower) ?? true
    const matchesKasir = selectedKasir ? s.user_id === selectedKasir : true
    return matchesSearch && matchesKasir
  })

  const handleExportCSV = () => {
    const headers = ['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Barang Terjual', 'Modal Awal', 'Total Penjualan', 'Kas Akhir (Sistem)', 'Kas Akhir (Fisik)', 'Selisih', 'Status']
    const csvData = filteredShifts.map(s => {
      const start = format(new Date(s.start_time), 'dd/MM/yyyy HH:mm', { locale: localeID })
      const end = s.end_time ? format(new Date(s.end_time), 'dd/MM/yyyy HH:mm', { locale: localeID }) : '-'
      const kasir = s.user?.full_name || '-'
      const items = (s.shiftItems || []).map(i => `${i.name} (${i.qty})`).join('; ')
      const totalPenjualan = (s.shiftItems || []).reduce((sum, i) => sum + (i.subtotal || 0), 0)
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        start, end, kasir, items,
        s.starting_cash,
        totalPenjualan,
        s.ending_cash_system || 0,
        s.ending_cash_actual || 0,
        selisih,
        s.status === 'closed' ? 'Selesai' : 'Aktif'
      ].join(',')
    })
    
    const csv = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `Riwayat_Shift_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const today = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: localeID })

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col print:p-0 print:space-y-0">
      <div className="page-header flex-shrink-0 print:hidden flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="page-title">Riwayat Shift Kasir</h1>
          <p className="page-subtitle">Pantau pembukaan dan penutupan shift serta rekonsiliasi kas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCSV} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" /> Export CSV
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
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {userRole === 'super_admin' && (
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
            <div className="flex items-center gap-2">
              <select value={selectedKasir} onChange={e => setSelectedKasir(e.target.value)} className="input min-w-[160px] bg-white">
                <option value="">Semua Kasir</option>
                {uniqueUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white print:overflow-visible">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-dark-900 pb-6 pt-4">
            <h1 className="text-2xl font-black text-dark-900 uppercase tracking-wider mb-2">LAPORAN RIWAYAT SHIFT KASIR</h1>
            <h2 className="text-lg font-bold text-dark-700">SBR FROZEN POS</h2>
            <p className="text-dark-500 mt-2 text-sm font-medium">Dicetak pada: {today} | Total: {filteredShifts.length} Shift</p>
          </div>

          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center print:border-l">No</th>
                <th>Waktu Shift</th>
                {userRole === 'super_admin' && <th>Kasir</th>}
                <th>Barang Terjual</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Total Penjualan</th>
                <th className="text-right">Kas Akhir (Sistem)</th>
                <th className="text-right">Kas Akhir (Fisik)</th>
                <th className="text-center">Selisih</th>
                <th className="text-center print:border-r">Status</th>
                <th className="w-16 text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'super_admin' ? 10 : 9} className="text-center py-12 text-dark-400">
                    <Clock className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada riwayat shift</p>
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift, index) => {
                  const selisih = (shift.ending_cash_actual || 0) - (shift.ending_cash_system || 0)
                  return (
                    <tr key={shift.id}>
                      <td className="text-center text-dark-400 text-sm print:border-l">{index + 1}</td>
                      <td>
                        <div className="font-semibold text-dark-900 whitespace-nowrap">
                          {format(new Date(shift.start_time), 'dd MMM yyyy, HH:mm', { locale: localeID })}
                        </div>
                        <div className="text-xs text-dark-500 mt-0.5 whitespace-nowrap">
                          sd {shift.end_time ? format(new Date(shift.end_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) : 'Sekarang'}
                        </div>
                      </td>
                      {userRole === 'super_admin' && (
                        <td className="font-medium text-dark-900">{shift.user?.full_name}</td>
                      )}
                      <td className="min-w-[200px]">
                        {shift.shiftItems && shift.shiftItems.length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            {shift.shiftItems.map((item: any, i: number) => (
                              <div key={i} className="text-xs flex justify-between gap-2 border-b border-dark-50 pb-1 last:border-0 last:pb-0">
                                <span className="truncate" title={item.name}>{item.name}</span>
                                <span className="font-semibold whitespace-nowrap">{item.qty} pcs</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-dark-400 italic">Belum ada penjualan</span>
                        )}
                      </td>
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.shiftItems?.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0) || 0)}
                      </td>
                      <td className="text-right text-dark-700">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_system || 0) : '-'}
                      </td>
                      <td className="text-right text-dark-900 font-semibold">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_actual || 0) : '-'}
                      </td>
                      <td className="text-center">
                        {shift.status === 'closed' ? (
                          <span className={cn(
                            'font-bold',
                            selisih > 0 ? 'text-success' : selisih < 0 ? 'text-danger' : 'text-dark-400'
                          )}>
                            {selisih === 0 ? 'Seimbang' : selisih > 0 ? `+${formatRupiah(selisih)}` : formatRupiah(selisih)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-center print:border-r">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold tracking-wider',
                          shift.status === 'open' 
                            ? 'bg-primary-500 text-white shadow-glow-primary animate-pulse' 
                            : 'bg-dark-100 text-dark-500'
                        )}>
                          {shift.status === 'closed' ? 'SELESAI' : 'AKTIF'}
                        </span>
                      </td>
                      <td className="text-center print:hidden">
                        {shift.status === 'closed' ? (
                          <a 
                            href={`/print/shift/${shift.id}`} 
                            target="_blank"
                            className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors mx-auto"
                            title="Cetak Rekap Shift (Receipt)"
                          >
                            <Printer className="w-4 h-4" />
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
