'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Download, Printer, Filter, ChevronRight, Package, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'

interface TransfersClientProps {
  userRole: string
}

export default function TransfersClient({ userRole }: TransfersClientProps) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [fromDate, toDate, selectedWarehouse])

  const fetchWarehouses = async () => {
    try {
      const { data } = await supabase.from('warehouses').select('id, name').order('name')
      if (data) setWarehouses(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('stock_transfers')
        .select(`
          *,
          from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name),
          to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name),
          creator:profiles!stock_transfers_user_id_fkey(full_name),
          receiver:profiles!stock_transfers_received_by_fkey(full_name),
          items:stock_transfer_items(
            id, qty_sent, qty_received, product:products(name, sku, unit)
          )
        `)

      if (fromDate) query.gte('created_at', `${fromDate}T00:00:00.000Z`)
      if (toDate) query.lte('created_at', `${toDate}T23:59:59.999Z`)
      
      // Filter by warehouse (either as source or destination)
      if (selectedWarehouse) {
        query.or(`from_warehouse_id.eq.${selectedWarehouse},to_warehouse_id.eq.${selectedWarehouse}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setTransfers(data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransfers = transfers.filter(t => 
    t.reference_number.toLowerCase().includes(search.toLowerCase()) ||
    t.from_warehouse?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.to_warehouse?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportCSV = () => {
    if (filteredTransfers.length === 0) return
    
    // Prepare headers
    const headers = ['No', 'Tanggal', 'No. Referensi', 'Asal Gudang', 'Tujuan Gudang', 'Total Item', 'Status', 'Pembuat']
    
    // Prepare rows
    const rows = filteredTransfers.map((t, index) => [
      index + 1,
      format(new Date(t.transfer_date), 'dd MMM yyyy HH:mm'),
      t.reference_number,
      t.from_warehouse?.name || '-',
      t.to_warehouse?.name || '-',
      t.items?.length || 0,
      t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Tertunda' : t.status,
      t.creator?.full_name || '-'
    ])
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `laporan_transfer_stok_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col print:p-0 print:space-y-4">
      <div className="page-header flex-shrink-0 print:m-0 print:p-0 print:border-none">
        <div>
          <h1 className="page-title print:text-xl">Histori Transfer Barang</h1>
          <p className="page-subtitle no-print">Pantau riwayat pergerakan stok antar gudang.</p>
          <p className="hidden print:block text-sm text-dark-500 mt-1">Dicetak pada: {format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0 no-print">
          <button onClick={handleExportCSV} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-md btn-primary whitespace-nowrap">
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-dark-100 flex flex-wrap gap-4 bg-white flex-shrink-0 no-print">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari no. referensi atau nama gudang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-xs">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <select 
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="input pl-9 appearance-none"
              >
                <option value="">Semua Gudang</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input w-36 text-sm" />
            <span className="text-dark-400">-</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input w-36 text-sm" />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white print:overflow-visible">
          <table className="data-table-dense w-full">
            <thead className="sticky top-0 z-10 bg-dark-50 print:bg-slate-600 print:text-white">
              <tr>
                <th className="w-12 text-center border-l-0">No</th>
                <th>Tanggal</th>
                <th>No. Referensi</th>
                <th>Asal Gudang</th>
                <th className="w-10 text-center px-0 no-print"></th>
                <th>Tujuan Gudang</th>
                <th className="text-right">Total Item</th>
                <th className="text-center">Status</th>
                <th>Pembuat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">Loading...</td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">
                    <Package className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada histori transfer</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t, index) => (
                  <tr key={t.id}>
                    <td className="text-center text-dark-400 border-l-0">{index + 1}</td>
                    <td>{format(new Date(t.transfer_date), 'dd MMM yyyy, HH:mm', { locale: id })}</td>
                    <td className="font-mono text-xs font-semibold">{t.reference_number}</td>
                    <td className="font-semibold text-dark-700">{t.from_warehouse?.name}</td>
                    <td className="text-center px-0 no-print"><ArrowRight className="w-4 h-4 text-dark-300 mx-auto" /></td>
                    <td className="font-semibold text-primary-700">{t.to_warehouse?.name}</td>
                    <td className="text-right font-bold">{t.items?.length || 0} Barang</td>
                    <td className="text-center">
                      <span className={cn(
                        "badge",
                        t.status === 'completed' ? 'badge-success' : 
                        t.status === 'pending' ? 'badge-warning' : 'badge-gray'
                      )}>
                        {t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Tertunda' : t.status}
                      </span>
                    </td>
                    <td className="text-dark-600">{t.creator?.full_name}</td>
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
