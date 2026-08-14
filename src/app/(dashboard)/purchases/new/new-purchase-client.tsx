'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Search, Calendar, ChevronDown, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { formatRupiah } from '@/lib/utils/currency'
import type { Product, Supplier } from '@/types/database'
import Link from 'next/link'

interface CartItem {
  id: string // local id
  product: Product | null
  qty: number
  unit_price: number
  subtotal: number
}

interface NewPurchaseClientProps {
  products: Product[]
  suppliers: Supplier[]
  userId: string
  branchId: string
}

function ProductCombobox({ 
  item, 
  products, 
  isActive, 
  onActivate,
  onDeactivate,
  onSelect
}: {
  item: CartItem
  products: Product[]
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onSelect: (p: Product) => void
}) {
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (isActive) onDeactivate()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, onDeactivate])

  if (!isActive && item.product) {
    return (
      <div 
        className="flex flex-col cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-dark-200 w-full text-left"
        onClick={onActivate}
      >
        <span className="font-semibold text-dark-900 leading-tight line-clamp-1">{item.product.name}</span>
        <span className="text-xs text-dark-400 font-mono mt-0.5">{item.product.sku}</span>
      </div>
    )
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center bg-white border border-primary-300 rounded-lg overflow-hidden shadow-sm ring-2 ring-primary-500/20 transition-all"
        onClick={!isActive ? onActivate : undefined}
      >
        <Search className="w-4 h-4 text-primary-500 ml-3 shrink-0" />
        <input
          autoFocus={isActive}
          type="text"
          value={search}
          className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-dark-900 placeholder:text-dark-300"
          placeholder={isActive ? "Ketik nama barang..." : "Pilih barang..."}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={onActivate}
        />
      </div>
      
      {isActive && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dark-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 animate-slide-up">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-center text-dark-400">Barang tidak ditemukan.</p>
            ) : (
              filtered.map(p => (
                <div
                  key={p.id}
                  className="flex flex-col p-2.5 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors border-b border-dark-50 last:border-0 text-left"
                  onClick={() => {
                    onSelect(p)
                    setSearch('')
                  }}
                >
                  <span className="font-semibold text-dark-900 text-sm">{p.name}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-dark-400 font-mono">{p.sku}</span>
                    <span className="text-xs font-medium text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded">Sisa: {p.stock_quantity} {p.unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewPurchaseClient({ products, suppliers, userId, branchId }: NewPurchaseClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Header State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-BUY-${Date.now()}`)
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [supplierId, setSupplierId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'tempo'>('lunas')
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'qris' | 'tempo'>('tunai')
  const [notes, setNotes] = useState('')
  
  // Items State
  const [items, setItems] = useState<CartItem[]>([
    { id: '1', product: null, qty: 1, unit_price: 0, subtotal: 0 }
  ])
  
  const [loading, setLoading] = useState(false)
  const [activeProductSearchId, setActiveProductSearchId] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveProductSearchId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addEmptyRow = () => {
    setItems([...items, { id: Date.now().toString(), product: null, qty: 1, unit_price: 0, subtotal: 0 }])
  }

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    } else {
      setItems([{ id: Date.now().toString(), product: null, qty: 1, unit_price: 0, subtotal: 0 }])
    }
  }

  const selectProduct = (rowId: string, product: Product) => {
    setItems(items.map(item => {
      if (item.id === rowId) {
        const qty = item.qty || 1
        const unit_price = product.hpp > 0 ? product.hpp : 0 // Default to current HPP
        return {
          ...item,
          product,
          unit_price,
          subtotal: qty * unit_price
        }
      }
      return item
    }))
    setActiveProductSearchId(null)
    
    // Auto add new row if this was the last row
    if (items[items.length - 1].id === rowId) {
       addEmptyRow()
    }
  }

  const updateItemQty = (rowId: string, qty: number) => {
    setItems(items.map(item => {
      if (item.id === rowId) {
        return { ...item, qty, subtotal: qty * item.unit_price }
      }
      return item
    }))
  }

  const updateItemPrice = (rowId: string, unit_price: number) => {
    setItems(items.map(item => {
      if (item.id === rowId) {
        return { ...item, unit_price, subtotal: item.qty * unit_price }
      }
      return item
    }))
  }

  const validItems = items.filter(item => item.product !== null && item.qty > 0 && item.unit_price > 0)
  const totalAmount = validItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSave = async () => {
    if (!supplierId) return toast.error('Pilih pemasok terlebih dahulu')
    if (!invoiceNumber.trim()) return toast.error('Nomor Invoice wajib diisi')
    if (validItems.length === 0) return toast.error('Belum ada produk valid yang dimasukkan')

    setLoading(true)
    try {
      // 1. Insert Purchase Header
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          invoice_number: invoiceNumber,
          supplier_id: supplierId,
          user_id: userId,
          branch_id: branchId,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          purchase_date: purchaseDate,
          notes: notes,
        }])
        .select()
        .single()

      if (purchaseError) throw purchaseError
      const purchaseId = purchaseData.id

      // 2. Insert Items and Update Stock/HPP
      for (const item of validItems) {
        if (!item.product) continue

        // Insert item
        const { error: itemError } = await supabase
          .from('purchase_items')
          .insert([{
            purchase_id: purchaseId,
            product_id: item.product.id,
            qty: item.qty,
            unit_price: item.unit_price,
            subtotal: item.subtotal
          }])
        if (itemError) throw itemError

        // Update product stock and HPP globally
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity + item.qty,
            hpp: item.unit_price // Update HPP to latest buy price
          })
          .eq('id', item.product.id)
        if (stockError) throw stockError
        
        // Update product_stocks for the branch
        const { data: currentStock } = await supabase
          .from('product_stocks')
          .select('stock_quantity')
          .eq('product_id', item.product.id)
          .eq('branch_id', branchId)
          .single()
        
        const branchStock = currentStock ? Number(currentStock.stock_quantity) : 0;
        
        if (currentStock) {
          await supabase.from('product_stocks').update({ stock_quantity: branchStock + item.qty }).eq('product_id', item.product.id).eq('branch_id', branchId)
        } else {
          await supabase.from('product_stocks').insert([{ product_id: item.product.id, branch_id: branchId, stock_quantity: item.qty }])
        }
        
        // Log to stock adjustments
        await supabase.from('stock_adjustments').insert([{
          product_id: item.product.id,
          branch_id: branchId,
          user_id: userId,
          type: 'tambah',
          qty_before: branchStock,
          qty_change: item.qty,
          qty_after: branchStock + item.qty,
          reason: `Restock Pembelian: ${invoiceNumber}`,
          reference_id: purchaseId
        }])
      }

      toast.success('Faktur Pembelian berhasil disimpan!')
      router.push('/purchases')
      router.refresh()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan pembelian')
    } finally {
      setLoading(false)
    }
  }

  // --- Product Search Combobox inside Table ---
  const renderProductCell = (item: CartItem) => {
    return (
      <ProductCombobox
        item={item}
        products={products}
        isActive={activeProductSearchId === item.id}
        onActivate={() => setActiveProductSearchId(item.id)}
        onDeactivate={() => setActiveProductSearchId(null)}
        onSelect={(p) => selectProduct(item.id, p)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Top Navigation */}
      <div className="bg-white border-b border-dark-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/purchases" className="w-10 h-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-500 hover:text-dark-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark-900">Faktur Pembelian Baru</h1>
            <p className="text-sm text-dark-500">Catat penerimaan barang / kulakan dari pemasok</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/purchases')} className="btn-md btn-outline bg-white">
            Batal
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading || validItems.length === 0 || !supplierId}
            className="btn-md btn-primary px-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Simpan Pembelian
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark-100">
          <h2 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            Informasi Faktur
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="form-group">
              <label className="label">Pemasok *</label>
              <select 
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="input bg-white font-medium"
              >
                <option value="" disabled>-- Pilih Pemasok --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">No. Invoice / Referensi *</label>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input font-mono text-dark-900"
                placeholder="Contoh: INV/2023/001"
              />
            </div>
            
            <div className="form-group">
              <label className="label">Tanggal Transaksi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input 
                  type="date" 
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Status Pembayaran</label>
              <select 
                value={paymentStatus}
                onChange={(e) => {
                  setPaymentStatus(e.target.value as any)
                  if (e.target.value === 'tempo') setPaymentMethod('tempo')
                  else setPaymentMethod('tunai')
                }}
                className="input bg-white"
              >
                <option value="lunas">Lunas (Langsung Dibayar)</option>
                <option value="tempo">Belum Lunas (Tempo/Kredit)</option>
              </select>
            </div>
            
            {paymentStatus === 'lunas' && (
              <div className="form-group">
                <label className="label">Metode Pembayaran</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="input bg-white"
                >
                  <option value="tunai">Tunai (Laci Kasir)</option>
                  <option value="transfer">Transfer (Bank)</option>
                  <option value="qris">QRIS (Bank)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden flex flex-col">
           <div className="p-4 border-b border-dark-100 bg-slate-50/50 flex justify-between items-center">
             <h2 className="text-sm font-bold text-dark-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-dark-800"></span>
                Daftar Barang
             </h2>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-white border-b border-dark-100 text-xs font-bold text-dark-500 uppercase tracking-wider">
                   <th className="p-4 w-[350px]">Produk / Barang</th>
                   <th className="p-4 w-[120px]">Kuantitas</th>
                   <th className="p-4 w-[120px]">Satuan</th>
                   <th className="p-4 w-[200px]">Harga Beli (HPP)</th>
                   <th className="p-4 w-[200px] text-right">Subtotal</th>
                   <th className="p-4 w-[60px] text-center">Aksi</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-dark-50">
                 {items.map((item, index) => (
                   <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="p-3 align-top relative">
                       {renderProductCell(item)}
                     </td>
                     
                     <td className="p-3 align-top">
                       <input 
                         type="number"
                         min="1"
                         className="input py-2 text-center"
                         value={item.qty || ''}
                         onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                         disabled={!item.product}
                       />
                     </td>
                     
                     <td className="p-3 align-top pt-5">
                       <span className="text-sm font-medium text-dark-600 bg-dark-50 px-3 py-1.5 rounded-lg border border-dark-100 inline-block w-full text-center">
                         {item.product ? item.product.unit : '-'}
                       </span>
                     </td>
                     
                     <td className="p-3 align-top">
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm font-medium">Rp</span>
                         <input 
                           type="number"
                           min="0"
                           className="input py-2 pl-9"
                           value={item.unit_price || ''}
                           onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                           disabled={!item.product}
                         />
                       </div>
                       {item.product && item.unit_price !== item.product.hpp && (
                         <p className="text-[10px] text-warning mt-1.5 font-medium flex items-center gap-1">
                           HPP Lama: {formatRupiah(item.product.hpp)}
                         </p>
                       )}
                     </td>
                     
                     <td className="p-3 align-top text-right pt-5 font-bold text-dark-900">
                       {formatRupiah(item.subtotal)}
                     </td>
                     
                     <td className="p-3 align-top text-center pt-4">
                       <button 
                         onClick={() => removeRow(item.id)}
                         className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-300 hover:text-danger hover:bg-danger/10 transition-colors mx-auto"
                         title="Hapus Baris"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="p-4 border-t border-dark-100 bg-white flex justify-center">
             <button 
               onClick={addEmptyRow}
               className="btn-sm btn-outline text-primary-600 border-primary-200 hover:bg-primary-50 px-6"
             >
               <Plus className="w-4 h-4 mr-1.5" />
               Tambah Baris Kosong
             </button>
           </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full bg-white p-5 rounded-2xl shadow-sm border border-dark-100">
             <h3 className="text-sm font-bold text-dark-800 mb-3">Catatan Pembelian</h3>
             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="input resize-none h-24"
               placeholder="Tulis keterangan atau catatan khusus untuk faktur ini..."
             />
          </div>
          
          <div className="w-full md:w-[400px] bg-dark-900 p-6 rounded-2xl shadow-lg text-white">
             <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Total Tagihan</h3>
             <div className="flex justify-between items-center mb-6">
                <span className="text-white/80">Subtotal</span>
                <span className="font-medium">{formatRupiah(totalAmount)}</span>
             </div>
             
             <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-lg font-medium text-white/80">TOTAL</span>
                <span className="text-3xl font-black text-primary-400 tracking-tight">
                  {formatRupiah(totalAmount)}
                </span>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
