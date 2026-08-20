'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, Filter, Receipt, Wallet, Calendar, Download, RefreshCw 
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface HutangClientProps {
  branches: any[]
  suppliers: any[]
  userId: string
}

export default function HutangClient({ branches, suppliers, userId }: HutangClientProps) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState<string>('Semua')
  
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
  
  const [fromDate, setFromDate] = useState(firstDay)
  const [toDate, setToDate] = useState(lastDay)
  
  const supabase = createClient()

  const fetchHutang = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        supplier:supplier_id(name, code),
        branch:branch_id(name)
      `)
      .neq('payment_status', 'lunas')
      .gte('purchase_date', fromDate)
      .lte('purchase_date', toDate)
      .order('purchase_date', { ascending: false })

    if (error) {
      toast.error('Gagal mengambil data hutang')
    } else {
      setPurchases(data || [])
    }
  }

  useEffect(() => {
    fetchHutang()
  }, [fromDate, toDate])

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const searchLower = search.toLowerCase()
      const matchesSearch = p.invoice_number?.toLowerCase().includes(searchLower) || false
      const matchesSupplier = supplierFilter === 'Semua' || p.supplier_id === supplierFilter
      return matchesSearch && matchesSupplier
    })
  }, [purchases, search, supplierFilter])

  const totalHutang = filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0)
  const totalPembayaran = filteredPurchases.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
  const sisaHutang = filteredPurchases.reduce((sum, p) => sum + Math.max(0, p.total_amount - (p.amount_paid || 0)), 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Data Transaksi Hutang</h1>
          <p className="page-subtitle">Kelola dan pantau tagihan pembelian yang belum lunas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div className="card p-5 bg-gradient-to-br from-white to-danger-50 border-danger-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-danger-700 mb-1">Total Hutang</p>
              <h3 className="text-2xl font-bold text-danger-900 text-money">{formatRupiah(totalHutang)}</h3>
            </div>
            <div className="w-12 h-12 bg-danger-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Receipt className="w-6 h-6 text-danger-700" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-white to-success-50 border-success-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-success-700 mb-1">Total Pembayaran</p>
              <h3 className="text-2xl font-bold text-success-900 text-money">{formatRupiah(totalPembayaran)}</h3>
            </div>
            <div className="w-12 h-12 bg-success-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-success-700" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-white to-warning-50 border-warning-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warning-700 mb-1">Sisa Hutang Berjalan</p>
              <h3 className="text-2xl font-bold text-warning-900 text-money">{formatRupiah(sisaHutang)}</h3>
            </div>
            <div className="w-12 h-12 bg-warning-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-warning-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Cari No. Faktur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 h-10 w-full bg-white"
              />
            </div>
            
            <div className="relative flex-1 sm:w-auto min-w-[150px]">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="input pl-9 h-10 w-full bg-white appearance-none"
              >
                <option value="Semua">Semua Pemasok</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input h-10" />
            <span className="text-dark-400">-</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input h-10" />
          </div>
        </div>

        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="table">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="text-left py-3 px-4">Tanggal Beli</th>
                <th className="text-left py-3 px-4">No. Faktur</th>
                <th className="text-left py-3 px-4">Pemasok</th>
                <th className="text-left py-3 px-4">Tempo Pembayaran</th>
                <th className="text-left py-3 px-4">Metode</th>
                <th className="text-right py-3 px-4">Total Transaksi</th>
                <th className="text-right py-3 px-4">Total Pembayaran</th>
                <th className="text-right py-3 px-4">Sisa Hutang</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-dark-400">
                    Tidak ada transaksi hutang yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const sisa = Math.max(0, p.total_amount - (p.amount_paid || 0))
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4 whitespace-nowrap">{new Date(p.purchase_date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4 font-mono font-medium text-primary-600">{p.invoice_number}</td>
                      <td className="py-3 px-4">{p.supplier?.name || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{p.due_date ? new Date(p.due_date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="py-3 px-4 uppercase text-xs font-semibold">{p.payment_method}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatRupiah(p.total_amount)}</td>
                      <td className="py-3 px-4 text-right text-success-600 font-medium">{formatRupiah(p.amount_paid || 0)}</td>
                      <td className="py-3 px-4 text-right text-danger-600 font-bold">{formatRupiah(sisa)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${p.payment_status === 'tempo' ? 'badge-danger' : 'badge-warning'}`}>
                          {p.payment_status.toUpperCase()}
                        </span>
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
