'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Receipt, Wallet, Calendar, CreditCard, Filter } from 'lucide-react'
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
  const [supplierFilter, setSupplierFilter] = useState<string>('all')
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
        branch:branch_id(id, name),
        items:purchase_items(id, qty, products:product_id(name))
      `)
      .neq('payment_status', 'lunas')
      .gte('purchase_date', fromDate)
      .lte('purchase_date', toDate)
      .order('purchase_date', { ascending: false })

    if (error) toast.error('Gagal mengambil data hutang')
    else setPurchases(data || [])
  }

  useEffect(() => { fetchHutang() }, [fromDate, toDate])

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const searchLower = search.toLowerCase()
      const matchesSearch = p.invoice_number?.toLowerCase().includes(searchLower) ||
        p.supplier?.name?.toLowerCase().includes(searchLower) || false
      const matchesSupplier = supplierFilter === 'all' || p.supplier_id === supplierFilter
      return matchesSearch && matchesSupplier
    })
  }, [purchases, search, supplierFilter])

  const totalHutang = filteredPurchases.reduce((s, p) => s + p.total_amount, 0)
  const totalTerbayar = filteredPurchases.reduce((s, p) => s + (p.amount_paid || 0), 0)
  const sisaHutang = filteredPurchases.reduce((s, p) => s + Math.max(0, p.total_amount - (p.amount_paid || 0)), 0)

  const handlePaymentSuccess = (updated: any) => {
    setPurchases(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
    setPayingPurchase(null)
    fetchHutang()
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Hutang Barang</h1>
          <p className="page-subtitle">Pantau dan kelola tagihan pembelian yang belum lunas.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div className="card p-5 border-l-4 border-l-danger-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-danger-600 uppercase tracking-wider mb-1">Total Hutang</p>
              <h3 className="text-2xl font-bold text-dark-900">{formatRupiah(totalHutang)}</h3>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-danger-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-success-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-success-600 uppercase tracking-wider mb-1">Total Terbayar</p>
              <h3 className="text-2xl font-bold text-dark-900">{formatRupiah(totalTerbayar)}</h3>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-warning-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-warning-600 uppercase tracking-wider mb-1">Sisa Hutang</p>
              <h3 className="text-2xl font-bold text-dark-900">{formatRupiah(sisaHutang)}</h3>
            </div>
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3 border-b border-dark-100 bg-slate-50 flex-shrink-0">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Cari No. Faktur / Pemasok..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-9 !py-1.5 text-sm w-full bg-white"
              />
            </div>
            {/* Supplier Filter */}
            <div className="relative min-w-[160px]">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <select
                value={supplierFilter}
                onChange={e => setSupplierFilter(e.target.value)}
                className="input pl-8 h-9 !py-1 text-sm bg-white appearance-none min-w-full"
              >
                <option value="all">Semua Pemasok</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {/* Date Range */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-dark-500 font-medium">Dari</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input h-9 !py-1.5 text-sm" />
              <span className="text-xs text-dark-400">—</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input h-9 !py-1.5 text-sm" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-50 z-10">
              <tr>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase whitespace-nowrap">No. Faktur</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase">Pemasok</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase">Nama Barang</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-center">Total Qty</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-right">Total</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-right">Terbayar</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-right">Sisa</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-center">Status</th>
                <th className="py-3 px-3 text-xs font-bold text-dark-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-dark-400 text-sm">
                    Tidak ada transaksi hutang pada periode ini.
                  </td>
                </tr>
              ) : filteredPurchases.map(p => {
                const sisa = Math.max(0, p.total_amount - (p.amount_paid || 0))
                const isLunas = sisa === 0
                const itemNames = p.items?.map((i: any) => i.products?.name || '-').join(', ') || '-'
                const totalQty = p.items?.reduce((s: number, i: any) => s + (i.qty || 0), 0) || 0
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-xs text-dark-600 whitespace-nowrap">{new Date(p.purchase_date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-primary-600 text-xs whitespace-nowrap">{p.invoice_number}</td>
                    <td className="py-3 px-3 text-sm font-medium text-dark-800">{p.supplier?.name || '-'}</td>
                    <td className="py-3 px-3 text-xs text-dark-600 max-w-[200px] truncate" title={itemNames}>{itemNames}</td>
                    <td className="py-3 px-3 text-center text-sm font-semibold">{totalQty}</td>
                    <td className="py-3 px-3 text-right text-sm font-medium whitespace-nowrap">{formatRupiah(p.total_amount)}</td>
                    <td className="py-3 px-3 text-right text-sm text-success-600 font-medium whitespace-nowrap">{formatRupiah(p.amount_paid || 0)}</td>
                    <td className="py-3 px-3 text-right text-sm font-bold text-danger-600 whitespace-nowrap">{formatRupiah(sisa)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isLunas ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                        {isLunas ? '✓ LUNAS' : '⏳ TEMPO'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!isLunas && (
                        <button
                          onClick={() => setPayingPurchase(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <CreditCard className="w-3 h-3" />
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

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
