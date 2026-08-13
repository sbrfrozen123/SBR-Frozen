'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, Search, ArrowLeft, Loader2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { formatRupiah } from '@/lib/utils/currency'
import type { Product, Supplier } from '@/types/database'
import Link from 'next/link'

interface CartItem {
  product: Product
  qty: number
  unit_price: number
  subtotal: number
}

interface NewPurchaseClientProps {
  products: Product[]
  suppliers: Supplier[]
  userId: string
}

export default function NewPurchaseClient({ products, suppliers, userId }: NewPurchaseClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-BUY-${Date.now()}`)
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'tempo'>('lunas')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10) // Limit to 10 for performance

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.product.id === product.id)
    if (existing) {
      setCart(cart.map(c => 
        c.product.id === product.id 
          ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.unit_price } 
          : c
      ))
    } else {
      setCart([...cart, { product, qty: 1, unit_price: product.hpp, subtotal: product.hpp }])
    }
    toast.success(`${product.name} ditambahkan`)
  }

  const updateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) return
    setCart(cart.map(c => 
      c.product.id === productId 
        ? { ...c, qty: newQty, subtotal: newQty * c.unit_price } 
        : c
    ))
  }

  const updatePrice = (productId: string, newPrice: number) => {
    if (newPrice < 0) return
    setCart(cart.map(c => 
      c.product.id === productId 
        ? { ...c, unit_price: newPrice, subtotal: c.qty * newPrice } 
        : c
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(c => c.product.id !== productId))
  }

  const totalAmount = cart.reduce((acc, c) => acc + c.subtotal, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Keranjang kosong')
    if (!supplierId) return toast.error('Pilih pemasok terlebih dahulu')

    setLoading(true)
    try {
      // 1. Insert Purchase Header
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          invoice_number: invoiceNumber,
          supplier_id: supplierId,
          user_id: userId,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          notes: notes,
        }])
        .select()
        .single()

      if (purchaseError) throw purchaseError
      
      const purchaseId = purchaseData.id

      // 2. Insert Items and Update Stock
      for (const item of cart) {
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

        // Update product stock and HPP
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity + item.qty,
            hpp: item.unit_price // Update HPP to latest buy price
          })
          .eq('id', item.product.id)
        if (stockError) throw stockError
        
        // Log to stock adjustments
        await supabase.from('stock_adjustments').insert([{
          product_id: item.product.id,
          user_id: userId,
          type: 'tambah',
          qty_before: item.product.stock_quantity,
          qty_change: item.qty,
          qty_after: item.product.stock_quantity + item.qty,
          reason: `Restock Pembelian: ${invoiceNumber}`,
          reference_id: purchaseId
        }])
      }

      toast.success('Pembelian berhasil disimpan')
      router.push('/purchases')
      router.refresh()
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Terjadi kesalahan saat checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Left side: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-dark-100 bg-white">
        <div className="p-4 border-b border-dark-100 flex items-center gap-4 bg-white z-10">
          <Link href="/purchases" className="w-10 h-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-500 hover:text-dark-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari produk (Nama atau SKU)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 py-3 text-lg"
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="bg-white border border-dark-100 rounded-2xl p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-dark-50 rounded-xl mb-3 flex items-center justify-center text-dark-300 text-xs">
                  NO IMAGE
                </div>
                <div className="text-xs text-dark-400 font-mono mb-1">{product.sku}</div>
                <div className="font-semibold text-dark-900 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                  {product.name}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-money font-bold text-sm">{formatRupiah(product.hpp)}</div>
                  <div className="text-xs font-medium px-2 py-1 bg-dark-50 text-dark-600 rounded-md">
                    Stok: {product.stock_quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Cart & Checkout */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white flex-shrink-0 border-l border-dark-100 shadow-xl lg:shadow-none z-20 h-[50vh] lg:h-auto border-t lg:border-t-0 absolute lg:relative bottom-0 transition-transform duration-300 translate-y-0">
        <div className="p-4 border-b border-dark-100 bg-white">
          <h2 className="font-bold text-lg text-dark-900">Rincian Pembelian</h2>
          <div className="text-sm text-dark-500">{invoiceNumber}</div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-dark-400">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-white border border-dark-100 rounded-xl p-3 flex gap-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark-900 text-sm truncate">{item.product.name}</div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-dark-500">Harga/Unit:</span>
                    <input 
                      type="number" 
                      value={item.unit_price}
                      onChange={(e) => updatePrice(item.product.id, Number(e.target.value))}
                      className="input py-1 px-2 text-xs w-24 h-7"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="font-bold text-money text-sm">{formatRupiah(item.subtotal)}</div>
                    <div className="flex items-center gap-1 bg-dark-50 rounded-lg p-0.5 border border-dark-100">
                      <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-dark-600 hover:text-danger">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="number" 
                        value={item.qty}
                        onChange={(e) => updateQty(item.product.id, Number(e.target.value))}
                        className="w-10 h-7 text-center bg-transparent text-sm font-semibold focus:outline-none"
                      />
                      <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-dark-600 hover:text-primary-600">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="text-dark-300 hover:text-danger self-start transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-4 bg-dark-50 border-t border-dark-100">
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Pemasok *</label>
              <select 
                value={supplierId} 
                onChange={(e) => setSupplierId(e.target.value)}
                className="input bg-white w-full text-sm py-2"
              >
                <option value="">-- Pilih Pemasok --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-dark-600 mb-1 block">Status Pembayaran</label>
                <select 
                  value={paymentStatus} 
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="input bg-white w-full text-sm py-2"
                >
                  <option value="lunas">Lunas</option>
                  <option value="tempo">Tempo (Hutang)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Catatan</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="No. Surat Jalan / Info..."
                className="input bg-white w-full text-sm py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-dark-600">Total Tagihan</span>
            <span className="text-2xl font-bold text-money">{formatRupiah(totalAmount)}</span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={loading || cart.length === 0}
            className="w-full btn-primary py-4 text-base shadow-lg shadow-primary-500/30"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan Pembelian'}
          </button>
        </div>
      </div>
    </div>
  )
}
