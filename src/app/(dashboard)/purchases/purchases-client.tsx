'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ShoppingBag, CheckCircle, Loader2, Pencil } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { UserRole } from '@/types/database'

interface PurchaseData {
  id: string
  invoice_number: string
  purchase_date: string
  total_amount: number
  payment_status: string
  supplier?: { name: string }
  user?: { full_name: string }
}

interface PurchasesClientProps {
  initialPurchases: PurchaseData[]
  userRole: UserRole
}

export default function PurchasesClient({ initialPurchases, userRole }: PurchasesClientProps) {
  const [search, setSearch] = useState('')
  const [purchases, setPurchases] = useState(initialPurchases)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleMarkAsPaid = async (id: string, invoice: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status invoice ${invoice} menjadi LUNAS?`)) return
    
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ payment_status: 'lunas' })
        .eq('id', id)
        
      if (error) throw error
      
      setPurchases(prev => prev.map(p => 
        p.id === id ? { ...p, payment_status: 'lunas' } : p
      ))
      toast.success('Status pembayaran berhasil diperbarui!')
    } catch (error: any) {
      console.error(error)
      toast.error('Gagal memperbarui status pembayaran')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredPurchases = purchases.filter(p => {
    const searchLower = search.toLowerCase()
    return p.invoice_number.toLowerCase().includes(searchLower) ||
           (p.supplier?.name && p.supplier.name.toLowerCase().includes(searchLower))
  })

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Pembelian & Restock</h1>
          <p className="page-subtitle">Riwayat pembelian barang masuk dari pemasok ke gudang.</p>
        </div>
        {['super_admin', 'admin_gudang'].includes(userRole) && (
          <Link href="/purchases/new" className="btn-md btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Pembelian
          </Link>
        )}
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari no invoice atau nama pemasok..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Tanggal</th>
                <th>No. Invoice</th>
                <th>Pemasok</th>
                <th>Dibuat Oleh</th>
                <th className="text-right">Total Transaksi</th>
                <th className="text-center">Status</th>
                <th className="text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-400">
                    <ShoppingBag className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada riwayat pembelian</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase, index) => (
                  <tr key={purchase.id}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                    <td className="text-dark-600">
                      {new Date(purchase.purchase_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="font-mono text-primary-600 font-medium">
                      {purchase.invoice_number}
                    </td>
                    <td className="font-semibold text-dark-900">
                      {purchase.supplier?.name || '-'}
                    </td>
                    <td className="text-dark-600 text-sm">
                      {purchase.user?.full_name || '-'}
                    </td>
                    <td className="text-right font-semibold text-money">
                      {formatRupiah(purchase.total_amount)}
                    </td>
                    <td className="text-center">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-[11px] font-bold tracking-wider inline-flex items-center gap-1.5 border',
                        purchase.payment_status === 'lunas' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-warning/10 text-warning-700 border-warning/20'
                      )}>
                        {purchase.payment_status === 'lunas' ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                        )}
                        {purchase.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {['super_admin', 'admin_gudang'].includes(userRole) && (
                          <Link
                            href={`/purchases/${purchase.id}/edit`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit Pembelian"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {purchase.payment_status === 'tempo' && ['super_admin', 'admin_gudang'].includes(userRole) && (
                          <button 
                            onClick={() => handleMarkAsPaid(purchase.id, purchase.invoice_number)}
                            disabled={updatingId === purchase.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-success-600 hover:bg-success-50 transition-colors"
                            title="Tandai Lunas"
                          >
                            {updatingId === purchase.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-dark-100 bg-dark-50 flex items-center justify-between text-xs text-dark-500 flex-shrink-0">
          <div>Menampilkan <span className="font-semibold text-dark-900">{filteredPurchases.length}</span> transaksi</div>
          <div>Total: <span className="font-semibold text-dark-900 text-money">{formatRupiah(filteredPurchases.reduce((acc, curr) => acc + curr.total_amount, 0))}</span></div>
        </div>
      </div>
    </div>
  )
}
