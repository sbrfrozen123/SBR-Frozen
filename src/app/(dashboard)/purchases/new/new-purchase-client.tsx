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
  warehouses: any[]
  userId: string
  branchId: string | null
  defaultWarehouseId?: string | null
}

function ProductSearch({ 
  products, 
  onSelect
}: {
  products: Product[]
  onSelect: (p: Product) => void
}) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20) // Limit to 20 for performance

  return (
    <div className="relative w-full z-40 mb-2" ref={wrapperRef}>
      <label className="label mb-2 block text-primary-600">Cari & Tambah Produk ke Faktur</label>
      <div 
        className="flex items-center bg-white border border-primary-300 rounded-xl overflow-hidden shadow-sm ring-4 ring-primary-500/10 transition-all p-1"
      >
        <Search className="w-5 h-5 text-primary-500 ml-3 shrink-0" />
        <input
          type="text"
          value={search}
          className="w-full bg-transparent border-none focus:ring-0 text-base py-2.5 px-3 text-dark-900 placeholder:text-dark-300"
          placeholder="Ketik nama atau SKU produk untuk ditambahkan..."
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && search.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dark-100 rounded-xl shadow-2xl max-h-[350px] overflow-y-auto animate-slide-up">
          <div className="p-2">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-center text-dark-400">Barang tidak ditemukan.</p>
            ) : (
              filtered.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors border-b border-dark-50 last:border-0"
                  onClick={() => {
                    onSelect(p)
                    setSearch('')
                    setIsOpen(false)
                  }}
                >
                  <div>
                    <div className="font-semibold text-dark-900 text-sm">{p.name}</div>
                    <div className="text-xs text-dark-400 font-mono mt-0.5">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-dark-900">{formatRupiah(p.hpp)}</div>
                    <div className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full inline-block mt-1">Sisa Stok: {p.stock_quantity}</div>
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

export default function NewPurchaseClient({ products, suppliers, warehouses, userId, branchId, defaultWarehouseId }: NewPurchaseClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Header State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-BUY-${Date.now()}`)
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState(defaultWarehouseId || '')
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'tempo'>('tempo')
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'qris' | 'tempo'>('tempo')
  const [paymentAccount, setPaymentAccount] = useState<string>('')
  const [banks, setBanks] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  
  // Items State
  const [items, setItems] = useState<CartItem[]>([])
  
  const [loading, setLoading] = useState(false)

  // Fetch bank accounts from branch settings
  useEffect(() => {
    if (branchId) {
      supabase.from('branches').select('bank_name_1, bank_name_2').eq('id', branchId).single()
        .then(({ data }) => {
          if (data) {
            const b: string[] = []
            if (data.bank_name_1) b.push(data.bank_name_1)
            if (data.bank_name_2) b.push(data.bank_name_2)
            setBanks(b)
            if (b.length > 0) setPaymentAccount(b[0])
          }
        })
    }
  }, [branchId])

  const removeRow = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const addProduct = (product: Product) => {
    const existingIndex = items.findIndex(item => item.product?.id === product.id)
    if (existingIndex >= 0) {
      // Increment qty
      const newItems = [...items]
      newItems[existingIndex].qty += 1
      newItems[existingIndex].subtotal = newItems[existingIndex].qty * newItems[existingIndex].unit_price
      setItems(newItems)
      toast.success(`Kuantitas ${product.name} ditambah`, { id: 'qty-add' })
    } else {
      // Add new
      setItems([...items, { 
        id: Date.now().toString(), 
        product, 
        qty: 1, 
        unit_price: product.hpp > 0 ? product.hpp : 0, 
        subtotal: product.hpp > 0 ? product.hpp : 0
      }])
      toast.success(`${product.name} ditambahkan`, { id: 'item-add' })
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
      if (!warehouseId) return toast.error('Pilih gudang tujuan terlebih dahulu')
      
      const selectedWarehouse = warehouses.find((w: any) => w.id === warehouseId)
      const finalBranchId = branchId || (selectedWarehouse?.branch_id)
      
      if (!finalBranchId) return toast.error('Gudang yang dipilih tidak terkait dengan cabang mana pun. Silakan hubungi admin.')
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
          warehouse_id: warehouseId || null,
          user_id: userId,
          branch_id: finalBranchId,
          total_amount: totalAmount,
          amount_paid: paymentStatus === 'lunas' ? totalAmount : 0,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_account: (paymentMethod === 'transfer' || paymentMethod === 'qris') ? paymentAccount : null,
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
        
        // Update product_stocks for the warehouse
        let branchStock = 0;
        if (warehouseId) {
          const { data: currentStock } = await supabase
            .from('product_stocks')
            .select('stock_quantity')
            .eq('product_id', item.product.id)
            .eq('warehouse_id', warehouseId)
            .single()
          
          branchStock = currentStock ? Number(currentStock.stock_quantity) : 0;
          
          if (currentStock) {
            await supabase.from('product_stocks').update({ stock_quantity: branchStock + item.qty }).eq('product_id', item.product.id).eq('warehouse_id', warehouseId)
          } else {
            await supabase.from('product_stocks').insert([{ product_id: item.product.id, warehouse_id: warehouseId, stock_quantity: item.qty }])
          }
        }
        
        // Log to stock adjustments
        await supabase.from('stock_adjustments').insert([{
          product_id: item.product.id,
          branch_id: finalBranchId,
          warehouse_id: warehouseId || null,
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
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
              <label className="label">Gudang Tujuan *</label>
              <select 
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="input bg-white font-medium"
              >
                <option value="" disabled>-- Pilih Gudang --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
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
              <div className="input bg-amber-50 border-amber-300 text-amber-800 font-semibold flex items-center gap-2">
                <span>⏳</span>
                <span>Belum Lunas (Hutang) — Bayar via menu Hutang Barang</span>
              </div>
            </div>
            

          </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden flex flex-col p-6">
           <ProductSearch products={products} onSelect={addProduct} />
           
           <div className="overflow-x-auto mt-4 border border-dark-100 rounded-xl bg-white">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-slate-100 border-b border-dark-100 text-xs font-bold text-dark-500 uppercase tracking-wider">
                   <th className="p-4 w-[350px]">Produk / Barang</th>
                   <th className="p-4 w-[120px] text-center">Kuantitas</th>
                   <th className="p-4 w-[120px] text-center">Satuan</th>
                   <th className="p-4 w-[200px]">Harga Beli (HPP)</th>
                   <th className="p-4 w-[200px] text-right">Subtotal</th>
                   <th className="p-4 w-[60px] text-center">Aksi</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-dark-50">
                 {items.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="text-center p-8 text-dark-400 bg-slate-50/50">
                        Pilih produk di kolom pencarian di atas untuk menambahkan ke faktur.
                     </td>
                   </tr>
                 ) : (
                   items.map((item, index) => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="p-4 align-middle">
                         <div className="font-semibold text-dark-900 line-clamp-1">{item.product?.name}</div>
                         <div className="text-xs text-dark-400 font-mono mt-0.5">{item.product?.sku}</div>
                       </td>
                       
                       <td className="p-3 align-middle">
                         <input 
                           type="number"
                           min="1"
                           className="input py-2 text-center"
                           value={item.qty || ''}
                           onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                           disabled={!item.product}
                         />
                       </td>
                       
                       <td className="p-3 align-middle text-center">
                         <span className="text-sm font-medium text-dark-600 bg-dark-50 px-3 py-1.5 rounded-lg border border-dark-100 inline-block">
                           {item.product ? item.product.unit : '-'}
                         </span>
                       </td>
                       
                       <td className="p-3 align-middle">
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
                       
                       <td className="p-4 align-middle text-right font-bold text-dark-900">
                         {formatRupiah(item.subtotal)}
                       </td>
                       
                       <td className="p-3 align-middle text-center">
                         <button 
                           onClick={() => removeRow(item.id)}
                           className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-300 hover:text-danger hover:bg-danger/10 transition-colors mx-auto"
                           title="Hapus Baris"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
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
