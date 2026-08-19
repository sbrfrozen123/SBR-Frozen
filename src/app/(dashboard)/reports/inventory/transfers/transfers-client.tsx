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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
          *,
          from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name),
          to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name),
          creator:profiles!stock_transfers_user_id_fkey(full_name),
          receiver:profiles!stock_transfers_received_by_fkey(full_name),
          items:stock_transfer_items(
            id, quantity, product:products(name, sku, unit)
          )
        `)
        .order('created_at', { ascending: false })

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
    // ...
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Histori Transfer Barang</h1>
          <p className="page-subtitle">Pantau riwayat pergerakan stok antar gudang.</p>
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
              placeholder="Cari no. referensi atau nama gudang..." 
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
                <th>Tanggal</th>
                <th>No. Referensi</th>
                <th>Asal Gudang</th>
                <th className="w-10 text-center px-0"></th>
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
                    <td className="text-center px-0"><ArrowRight className="w-4 h-4 text-dark-300 mx-auto" /></td>
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
