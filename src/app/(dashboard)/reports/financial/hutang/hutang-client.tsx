'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, Filter, Receipt, Wallet, Calendar, CreditCard
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import SupplierPaymentModal from '@/components/purchases/SupplierPaymentModal'

interface HutangClientProps {
  branches: any[]
  suppliers: any[]
  userId: string
}

export default function HutangClient({ branches, suppliers, userId }: HutangClientProps) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState<string>('Semua')
  const [payingPurchase, setPayingPurchase] = useState<any | null>(null)
  
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
        supplier:supplier_id(id, name, code),
        branch:branch_id(id, name)
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
      const matchesSearch = p.invoice_number?.toLowerCase().includes(searchLower) ||
        p.supplier?.name?.toLowerCase().includes(searchLower) || false
      const matchesSupplier = supplierFilter === 'Semua' || p.supplier_id === supplierFilter
      return matchesSearch && matchesSupplier
    })
  }, [purchases, search, supplierFilter])

  const totalHutang = filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0)
  const totalPembayaran = filteredPurchases.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
  const sisaHutang = filteredPurchases.reduce((sum, p) => sum + Math.max(0, p.total_amount - (p.amount_paid || 0)), 0)

  const handlePaymentSuccess = (updatedPurchase: any) => {
    setPurchases(prev => prev.map(p => {
      if (p.id === updatedPurchase.id) return { ...p, ...updatedPurchase }
      return p
    }))
    setPayingPurchase(null)
    // Re-fetch to get latest data
    fetchHutang()
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Data Hutang Barang</h1>
          <p className="page-subtitle">Pantau dan kelola tagihan pembelian yang belum lunas.</p>
        </div>
      </div>

      {/* Summary Cards */}
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
              <p className="text-sm font-semibold text-success-700 mb-1">Total Terbayar</p>
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
              <p className="text-sm font-semibold text-warning-700 mb-1">Sisa Hutang</p>
              <h3 className="text-2xl font-bold text-warning-900 text-money">{formatRupiah(sisaHutang)}</h3>
            </div>
            <div className="w-12 h-12 bg-warning-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-warning-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-64 min-w-[160px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Cari No. Faktur / Pemasok..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 h-10 w-full bg-white"
              />
            </div>
            <div className="relative flex-1 sm:w-auto min-w-[160px]">
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input h-10 flex-1 sm:flex-none" />
            <span className="text-dark-400 flex-shrink-0">—</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input h-10 flex-1 sm:flex-none" />
          </div>
        </div>

        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="table min-w-[900px]">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Tanggal Beli</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">No. Faktur</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Pemasok</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Metode</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Total</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Terbayar</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Sisa</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Status</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-dark-400">
                    Tidak ada transaksi hutang yang ditemukan pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const sisa = Math.max(0, p.total_amount - (p.amount_paid || 0))
                  const isLunas = sisa === 0
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-sm">{new Date(p.purchase_date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-primary-600 text-sm">{p.invoice_number}</td>
                      <td className="py-3 px-4 text-sm font-medium">{p.supplier?.name || '-'}</td>
                      <td className="py-3 px-4 text-xs uppercase font-semibold text-dark-500">{p.payment_method === 'tempo' ? 'Kredit' : p.payment_method}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">{formatRupiah(p.total_amount)}</td>
                      <td className="py-3 px-4 text-right text-sm text-success-600 font-medium">{formatRupiah(p.amount_paid || 0)}</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-danger-600">{formatRupiah(sisa)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isLunas ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                          {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isLunas && (
                          <button
                            onClick={() => setPayingPurchase(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {payingPurchase && (
        <SupplierPaymentModal
          purchase={payingPurchase}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPayingPurchase(null)}
        />
      )}
    </div>
  )
}
