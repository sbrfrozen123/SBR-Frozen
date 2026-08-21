'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Product } from '@/types/database'
import { cn } from '@/lib/utils/cn'

interface StockAdjustmentModalProps {
  products: Product[]
  branchId: string | null
  warehouseId?: string | null
  warehouses?: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function StockAdjustmentModal({ products, branchId, warehouseId, warehouses, onSuccess, onCancel }: StockAdjustmentModalProps) {
  const supabase = createClient()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Form State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouseId || (warehouses?.[0]?.id) || '')
  const [actualStock, setActualStock] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'adjust' | 'history'>('adjust')

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const lowerQuery = searchQuery.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.sku.toLowerCase().includes(lowerQuery)
    ).slice(0, 5) // Limit to 5 results
  }, [searchQuery, products])

  // Get current stock for selected warehouse
  const currentStock = useMemo(() => {
    if (!selectedProduct || !selectedWarehouseId) return 0
    const breakdown = (selectedProduct as any).stock_breakdown || []
    const stock = breakdown.find((s: any) => s.warehouse_id === selectedWarehouseId)
    return stock ? stock.stock_quantity : 0
  }, [selectedProduct, selectedWarehouseId])

  // Calculated Difference
  const diff = useMemo(() => {
    if (!selectedProduct || actualStock === '') return 0
    const actual = Number(actualStock)
    if (isNaN(actual)) return 0
    return actual - currentStock
  }, [selectedProduct, actualStock, currentStock])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setSearchQuery('')
    
    // Auto fill with the current stock of selected warehouse
    const breakdown = (product as any).stock_breakdown || []
    const stock = breakdown.find((s: any) => s.warehouse_id === selectedWarehouseId)
    setActualStock(stock ? stock.stock_quantity.toString() : '0')
  }

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWhId = e.target.value
    setSelectedWarehouseId(newWhId)
    if (selectedProduct) {
      const breakdown = (selectedProduct as any).stock_breakdown || []
      const stock = breakdown.find((s: any) => s.warehouse_id === newWhId)
      setActualStock(stock ? stock.stock_quantity.toString() : '0')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault()\n    if (!branchId) return toast.error('Gagal: Pilih cabang spesifik di menu atas terlebih dahulu (Jangan gunakan Semua Cabang).')
    if (!selectedProduct || actualStock === '') return
    if (!selectedWarehouseId) {
      toast.error('Gudang wajib dipilih.')
      return
    }
    if (diff === 0) {
      toast.error('Tidak ada selisih stok untuk disesuaikan.')
      return
    }
    if (!reason.trim()) {
      toast.error('Alasan penyesuaian harus diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('User not authenticated')

      const type = diff > 0 ? 'tambah' : 'kurang'

      // 1. Insert into stock_adjustments
      const { error: insertError } = await supabase.from('stock_adjustments').insert({
        product_id: selectedProduct.id,
        user_id: userData.user.id,
        branch_id: branchId, // Required by DB
        warehouse_id: selectedWarehouseId,
        type: type,
        qty_before: currentStock,
        qty_change: Math.abs(diff),
        qty_after: Number(actualStock),
        reason: reason
      })

      if (insertError) throw insertError

      // 2. Update product_stocks
      const { error: updateError } = await supabase
        .from('product_stocks')
        .update({ stock_quantity: Number(actualStock) })
        .eq('product_id', selectedProduct.id)
        .eq('warehouse_id', selectedWarehouseId)

      if (updateError) throw updateError

      toast.success('Stok berhasil disesuaikan!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyesuaikan stok')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 bg-dark-50/50">
        <h2 className="text-lg font-semibold text-dark-900">Penyesuaian Stok (Stock Opname)</h2>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        <div className="mb-5">
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Gudang Lokasi Opname <span className="text-danger">*</span></label>
          <select 
            value={selectedWarehouseId} 
            onChange={handleWarehouseChange}
            className="input w-full bg-white cursor-pointer"
          >
            <option value="" disabled>-- Pilih Gudang --</option>
            {warehouses?.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input 
                type="text" 
                placeholder="Cari produk (Nama / SKU)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-full"
                autoFocus
              />
            </div>
            
            {searchQuery.trim() && (
              <div className="bg-white border border-dark-100 rounded-xl overflow-hidden shadow-sm">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-50 border-b border-dark-100 last:border-0 text-left transition-colors"
                    >
                      <div>
                        <div className="font-medium text-dark-900">{p.name}</div>
                        <div className="text-xs text-dark-400 font-mono mt-0.5">{p.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-dark-900">{p.stock_quantity} {p.unit}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-dark-400">
                    Produk tidak ditemukan
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-primary-50 text-primary-800 p-4 rounded-xl flex items-start gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Cari dan pilih produk yang stok fisiknya berbeda dengan stok di sistem untuk melakukan penyesuaian.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between bg-dark-50 p-4 rounded-xl border border-dark-100">
              <div>
                <div className="text-sm text-dark-500 mb-1">Produk Terpilih</div>
                <div className="font-semibold text-dark-900">{selectedProduct.name}</div>
                <div className="text-xs text-dark-400 font-mono">{selectedProduct.sku}</div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                Ganti Produk
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Stok Sistem</label>
                <div className="input bg-dark-50 text-dark-500 flex items-center cursor-not-allowed">
                  {currentStock} {selectedProduct.unit}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Stok Fisik Aktual <span className="text-danger">*</span></label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.001"
                    value={actualStock}
                    onChange={(e) => setActualStock(e.target.value)}
                    className="input w-full pr-12"
                    placeholder="Contoh: 10"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-dark-400">
                    {selectedProduct.unit}
                  </span>
                </div>
              </div>
            </div>

            {actualStock !== '' && diff !== 0 && (
              <div className={cn(
                "p-3 rounded-lg text-sm font-medium flex items-center justify-between",
                diff > 0 ? "bg-success-light/30 text-success-dark" : "bg-danger-light/30 text-danger"
              )}>
                <span>Selisih Stok:</span>
                <span>{diff > 0 ? '+' : ''}{diff} {selectedProduct.unit}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Alasan Penyesuaian <span className="text-danger">*</span></label>
              <textarea 
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Barang rusak saat dipindahkan, Salah hitung saat masuk..."
                className="input min-h-[80px] w-full resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onCancel}
                className="btn-md flex-1 bg-white border border-dark-200 text-dark-700 hover:bg-dark-50"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || diff === 0}
                className="btn-md btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
