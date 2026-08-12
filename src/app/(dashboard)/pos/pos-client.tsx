'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, Filter, ShoppingCart, User, Plus, Minus, Trash2, 
  ChevronRight, CreditCard, Banknote, QrCode, Clock, CheckCircle
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Product, Customer, UserRole } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface POSClientProps {
  products: Product[]
  customers: Partial<Customer>[]
  settings: any
  userRole: UserRole
  userId: string
}

interface CartItem {
  product: Product
  qty: number
  unit_price: number
}

export default function POSClient({ products, customers, settings, userRole, userId }: POSClientProps) {
  // States
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null)
  
  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'tunai'|'transfer'|'qris'|'tempo'>('tunai')
  const [amountPaid, setAmountPaid] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Derived data
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Umum'))
    return ['Semua', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'Semua' || (p.category || 'Umum') === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  // Pricing logic based on customer category
  const getProductPrice = (product: Product, customer: Partial<Customer> | null) => {
    if (!customer) return product.price_retail
    if (customer.category === 'grosir' && product.price_grosir) return product.price_grosir
    if (customer.category === 'horeca' && product.price_horeca) return product.price_horeca
    return product.price_retail
  }

  // Update cart prices when customer changes
  useEffect(() => {
    setCart(prev => prev.map(item => ({
      ...item,
      unit_price: getProductPrice(item.product, selectedCustomer)
    })))
  }, [selectedCustomer])

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error('Stok produk habis!')
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock_quantity) {
          toast.error('Melebihi stok yang tersedia!')
          return prev
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { product, qty: 1, unit_price: getProductPrice(product, selectedCustomer) }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.qty + delta
        if (newQty < 1) return item // handled by remove
        if (newQty > item.product.stock_quantity) {
          toast.error('Melebihi stok yang tersedia!')
          return item
        }
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.qty), 0)
  const taxRate = settings?.tax_percentage || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return
    if (paymentMethod === 'tempo') {
      if (!selectedCustomer) {
        toast.error('Pembayaran tempo wajib memilih pelanggan!')
        return
      }
      const newDebt = (selectedCustomer.current_debt || 0) + total
      if (selectedCustomer.credit_limit && selectedCustomer.credit_limit > 0 && newDebt > selectedCustomer.credit_limit) {
        toast.error(`Melebihi batas piutang pelanggan! (Batas: ${formatRupiah(selectedCustomer.credit_limit)})`)
        return
      }
    }

    const paid = amountPaid === '' ? 0 : Number(amountPaid)
    if (paymentMethod !== 'tempo' && paid < total) {
      toast.error('Nominal pembayaran kurang dari total tagihan!')
      return
    }

    setLoading(true)
    try {
      // Generate Invoice Number (e.g. INV-260812-XXXX)
      const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, '')
      const randomCode = Math.floor(1000 + Math.random() * 9000)
      const invoiceNumber = `INV-${dateStr}-${randomCode}`

      // 1. Insert Transaction
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert([{
          invoice_number: invoiceNumber,
          customer_id: selectedCustomer?.id || null,
          user_id: userId,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'tempo' ? 'piutang' : 'lunas',
          amount_paid: paymentMethod === 'tempo' ? paid : total,
          due_date: paymentMethod === 'tempo' ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : null // Default 30 days
        }])
        .select('id')
        .single()

      if (txnError) throw txnError

      // 2. Insert Transaction Items & Update Stock (Normally done via Edge Function for atomic safety, but doing client-side for v1)
      const txnItems = cart.map(item => ({
        transaction_id: txn.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        qty: item.qty,
        unit: item.product.unit,
        unit_price: item.unit_price,
        hpp_snapshot: item.product.hpp,
        subtotal: item.qty * item.unit_price
      }))

      const { error: itemsError } = await supabase.from('transaction_items').insert(txnItems)
      if (itemsError) throw itemsError

      // Update stocks
      for (const item of cart) {
        await supabase.from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.qty })
          .eq('id', item.product.id)
      }

      // Update customer debt if tempo
      if (paymentMethod === 'tempo' && selectedCustomer) {
        await supabase.from('customers')
          .update({ current_debt: (selectedCustomer.current_debt || 0) + (total - paid) })
          .eq('id', selectedCustomer.id)
      }

      toast.success('Transaksi berhasil!')
      
      // Reset
      setCart([])
      setSelectedCustomer(null)
      setIsCheckoutOpen(false)
      setAmountPaid('')
      setPaymentMethod('tunai')

      // Refresh page to get latest stocks (simple way)
      window.location.reload()

    } catch (error: any) {
      toast.error(error.message || 'Gagal memproses transaksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* LEFT PANEL: PRODUCT GRID */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-dark-100">
        {/* Toolbar */}
        <div className="p-4 bg-white border-b border-dark-100 flex-shrink-0 flex flex-col sm:flex-row gap-3 justify-between z-10 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari produk (F2)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  categoryFilter === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => {
              const price = getProductPrice(product, selectedCustomer)
              const isOutOfStock = product.stock_quantity <= 0
              
              return (
                <div 
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={cn(
                    'pos-product-card relative flex flex-col h-full bg-white',
                    isOutOfStock && 'opacity-60 cursor-not-allowed filter grayscale-[0.5]'
                  )}
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-dark-400 font-mono mb-1">{product.sku}</p>
                      <h3 className="font-semibold text-dark-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="mt-3">
                      <p className="text-primary-600 font-bold text-money">{formatRupiah(price)}</p>
                      <p className="text-xs text-dark-500 mt-0.5">Stok: {product.stock_quantity} {product.unit}</p>
                    </div>
                  </div>
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl">
                      <span className="bg-danger text-white text-xs font-bold px-2 py-1 rounded">HABIS</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CART */}
      <div className="w-full md:w-[400px] xl:w-[450px] bg-white flex flex-col flex-shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
        
        {/* Customer Selector */}
        <div className="p-4 border-b border-dark-100 flex-shrink-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dark-200 bg-dark-50 hover:bg-dark-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedCustomer ? 'bg-primary-100 text-primary-600' : 'bg-dark-200 text-dark-500'
                  )}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-dark-900">
                      {selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum (Retail)'}
                    </p>
                    <p className="text-xs text-dark-400 capitalize">
                      {selectedCustomer ? `${selectedCustomer.category} — Limit: ${formatRupiah(selectedCustomer.credit_limit || 0)}` : 'Walk-in Customer'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="w-[360px] max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-dark-100 p-2 z-50 animate-fade-in" align="end">
                <div className="px-2 py-2 border-b border-dark-50 mb-2">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">Pilih Pelanggan</p>
                </div>
                <DropdownMenu.Item 
                  onClick={() => setSelectedCustomer(null)}
                  className="flex flex-col px-3 py-2 rounded-lg cursor-pointer outline-none hover:bg-dark-50 mb-1"
                >
                  <span className="text-sm font-semibold text-dark-900">Pelanggan Umum (Retail)</span>
                  <span className="text-xs text-dark-400">Harga Retail Default</span>
                </DropdownMenu.Item>
                {customers.map(c => (
                  <DropdownMenu.Item 
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="flex flex-col px-3 py-2 rounded-lg cursor-pointer outline-none hover:bg-dark-50 mb-1"
                  >
                    <span className="text-sm font-semibold text-dark-900">{c.name}</span>
                    <span className="text-xs text-dark-400 capitalize">{c.category} • Piutang: {formatRupiah(c.current_debt || 0)}</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-dark-400">
              <ShoppingCart className="w-16 h-16 text-dark-100 mb-4" />
              <p className="font-medium text-dark-600">Keranjang masih kosong</p>
              <p className="text-sm mt-1">Pilih produk dari panel sebelah kiri.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-3 p-3 rounded-xl border border-dark-100 bg-white hover:border-primary-200 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-dark-900 line-clamp-1">{item.product.name}</h4>
                    <p className="text-primary-600 font-bold text-money text-sm mt-0.5">{formatRupiah(item.unit_price)}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-dark-50 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-dark-600 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-dark-600 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-danger/70 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="border-t border-dark-100 bg-dark-50 p-6 flex-shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-dark-500">
              <span>Subtotal</span>
              <span className="font-medium text-money">{formatRupiah(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm text-dark-500">
                <span>Pajak ({taxRate}%)</span>
                <span className="font-medium text-money">{formatRupiah(taxAmount)}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-dark-200 flex justify-between items-end">
              <span className="text-sm font-bold text-dark-900">Total Tagihan</span>
              <span className="text-2xl font-bold text-primary-600 text-money">{formatRupiah(total)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full btn-lg btn-primary shadow-glow-primary text-lg h-14"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="modal-overlay z-[100]">
          <div className="modal-content max-w-xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <div>
                <h2 className="text-xl font-bold text-dark-900">Selesaikan Pembayaran</h2>
                <p className="text-sm text-dark-500 mt-0.5">Total Tagihan: <span className="font-bold text-primary-600">{formatRupiah(total)}</span></p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-dark-400 hover:text-dark-600">
                <Trash2 className="w-5 h-5 rotate-45" /> {/* Use as X icon close equivalent for now or import X */}
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-3">Pilih Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'tunai', icon: Banknote, label: 'Uang Tunai', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  { id: 'transfer', icon: CreditCard, label: 'Transfer Bank', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { id: 'qris', icon: QrCode, label: 'QRIS', color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
                  { id: 'tempo', icon: Clock, label: 'Tempo (Piutang)', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map((method) => {
                  const isActive = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id as any)
                        if (method.id === 'tunai') setAmountPaid(total) // Auto fill for convenience
                        else setAmountPaid('')
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        isActive ? `${method.border} ${method.bg} shadow-sm scale-[0.98]` : 'border-dark-100 bg-white hover:border-dark-200'
                      )}
                    >
                      <method.icon className={cn('w-6 h-6', isActive ? method.color : 'text-dark-400')} />
                      <span className={cn('text-sm font-semibold', isActive ? 'text-dark-900' : 'text-dark-600')}>{method.label}</span>
                    </button>
                  )
                })}
              </div>

              {(paymentMethod === 'tunai' || paymentMethod === 'tempo') && (
                <div className="mb-6 animate-fade-in">
                  <label className="label">
                    {paymentMethod === 'tempo' ? 'DP / Dibayar Dimuka (Bila ada)' : 'Uang Diterima'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-xl">Rp</span>
                    <input 
                      type="number" 
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value ? Number(e.target.value) : '')}
                      className="input pl-12 h-14 text-xl font-bold text-dark-900" 
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  {paymentMethod === 'tunai' && amountPaid !== '' && Number(amountPaid) > total && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                      <span className="text-emerald-700 text-sm font-medium">Uang Kembalian:</span>
                      <span className="text-emerald-700 text-lg font-bold text-money">{formatRupiah(Number(amountPaid) - total)}</span>
                    </div>
                  )}
                  {paymentMethod === 'tempo' && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-700 text-sm font-medium">Sisa Tagihan (Piutang):</span>
                        <span className="text-amber-700 text-lg font-bold text-money">{formatRupiah(total - (Number(amountPaid) || 0))}</span>
                      </div>
                      <p className="text-xs text-amber-700/70 text-right">Jatuh tempo otomatis diset 30 hari.</p>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn-lg btn-primary h-14 text-lg"
              >
                {loading ? 'Memproses...' : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Selesaikan Transaksi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
