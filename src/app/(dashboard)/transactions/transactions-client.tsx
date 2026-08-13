'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Ban, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface TransactionHistoryProps {
  transactions: any[]
}

export default function TransactionHistoryClient({ transactions: initialTransactions }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)
  const supabase = createClient()

  const filtered = transactions.filter(t => 
    t.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTxn) return
    if (!voidReason.trim()) {
      toast.error('Alasan pembatalan wajib diisi')
      return
    }

    setIsVoiding(true)
    try {
      const { error } = await supabase.rpc('void_transaction', {
        txn_id: selectedTxn.id,
        void_reason: voidReason
      })

      if (error) throw error

      toast.success('Transaksi berhasil dibatalkan (Voided)')
      // Update local state
      setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, status: 'voided' } : t))
      setSelectedTxn(null)
      setVoidReason('')
    } catch (err: any) {
      toast.error(err.message || 'Gagal membatalkan transaksi')
    } finally {
      setIsVoiding(false)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-500" />
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-dark-500 mt-1">Daftar semua transaksi penjualan, dan fitur pembatalan (Void).</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input 
            type="text"
            placeholder="Cari No Invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                <th>Invoice</th>
                <th>Waktu</th>
                <th>Kasir</th>
                <th>Tipe</th>
                <th className="text-right">Total</th>
                <th className="text-center">Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-dark-400">Tidak ada transaksi.</td></tr>
              ) : (
                filtered.map(txn => (
                  <tr key={txn.id} className={txn.status === 'voided' ? 'bg-danger-light/10 opacity-70' : ''}>
                    <td className="font-mono font-medium text-dark-900">{txn.invoice_number}</td>
                    <td className="text-dark-600 text-sm">{formatDateShort(txn.created_at)}</td>
                    <td className="text-dark-900">{txn.profiles?.full_name}</td>
                    <td className="capitalize text-dark-600 text-sm">{txn.payment_method}</td>
                    <td className="text-right font-bold text-dark-900 text-money">{formatRupiah(txn.total_amount)}</td>
                    <td className="text-center">
                      {txn.status === 'voided' ? (
                        <span className="badge badge-danger">Batal (Void)</span>
                      ) : (
                        <span className="badge badge-success">Selesai</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => setSelectedTxn(txn)}
                        className="p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 rounded-lg transition-colors"
                        title="Lihat Detail & Void"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL / VOID */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-dark-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-dark-900">Detail Transaksi {selectedTxn.invoice_number}</h3>
                <p className="text-xs text-dark-500 mt-1">Kasir: {selectedTxn.profiles?.full_name} | {formatDateShort(selectedTxn.created_at)}</p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="text-dark-400 hover:text-dark-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-auto border-b border-dark-100">
              <h4 className="font-bold text-dark-900 mb-3 text-sm uppercase tracking-wide">Rincian Barang</h4>
              <div className="space-y-3">
                {selectedTxn.transaction_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-dark-50 p-3 rounded-xl">
                    <div>
                      <p className="font-bold text-dark-900 text-sm">{item.product_name}</p>
                      <p className="text-xs text-dark-500">{item.qty} {item.unit} x {formatRupiah(item.unit_price)}</p>
                    </div>
                    <div className="font-bold text-dark-900">{formatRupiah(item.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dark-100 flex justify-between items-center text-lg">
                <span className="font-bold text-dark-900">Total</span>
                <span className="font-black text-money text-primary-600">{formatRupiah(selectedTxn.total_amount)}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50">
              {selectedTxn.status === 'voided' ? (
                <div className="flex items-start gap-3 p-4 bg-danger-light/10 text-danger-700 rounded-xl border border-danger/20">
                  <Ban className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Transaksi ini telah Dibatalkan (Void)</p>
                    <p className="text-sm mt-1">Nilainya tidak masuk laporan laba/rugi, dan stok barang telah dikembalikan.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVoid} className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-danger-600 flex items-center gap-1.5">
                    <Ban className="w-4 h-4" /> Batal Transaksi (Void)
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Alasan pembatalan (wajib isi)..."
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    className="input border-danger/30 focus:border-danger focus:ring-danger/20"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="submit" disabled={isVoiding} className="btn-danger">
                      {isVoiding ? 'Memproses...' : 'Ya, Batalkan Transaksi Ini'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
