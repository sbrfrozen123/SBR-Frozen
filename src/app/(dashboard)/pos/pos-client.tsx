'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search, Filter, ShoppingCart, User, Plus, Minus, Trash2,
  ChevronRight, CreditCard, Banknote, QrCode, Clock, CheckCircle, Printer, MessageCircle, FileText
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Product, Customer, UserRole, CashierShift } from '@/types/database'
import { ShiftManagement } from '@/components/pos/ShiftManagement'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface POSClientProps {
  products: Product[]
  customers: Partial<Customer>[]
  settings: any
  userRole: UserRole
  userId: string
  branchId: string | null
  branch?: any
  defaultWarehouseId?: string | null
  editTxId?: string
}

interface CartItem {
  product: Product
  qty: number
  unit_price: number
  discount_amount?: number
}

export default function POSClient({ products, customers, settings, userRole, userId, branchId, branch, defaultWarehouseId, editTxId }: POSClientProps) {
  const [search, setSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null)

  // Shift State
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null)
  const [isShiftLoaded, setIsShiftLoaded] = useState(false)

  // Checkout & Receipt States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'qris' | 'tempo'>('tunai')
  const [amountPaid, setAmountPaid] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [completedTxn, setCompletedTxn] = useState<any>(null)
  const [editInvoiceNumber, setEditInvoiceNumber] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadEditTx() {
      if (!editTxId) return
      const { data: tx, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .eq('id', editTxId)
        .single()

      if (tx && !error) {
        setEditInvoiceNumber(tx.invoice_number)
        if (tx.customer_id) {
          const cust = customers.find(c => c.id === tx.customer_id)
          if (cust) setSelectedCustomer(cust)
        }
        setPaymentMethod(tx.payment_method)
        setAmountPaid(tx.amount_paid)

        const loadedCart: CartItem[] = (tx.transaction_items || []).map((ti: any) => {
          const product = products.find(p => p.id === ti.product_id)
          if (!product) return null
          return {
            product,
            qty: ti.qty,
            unit_price: ti.unit_price,
            discount_amount: ti.discount_amount || 0
          }
        }).filter(Boolean) as CartItem[]

        setCart(loadedCart)
        toast.success(`Mode Edit: ${tx.invoice_number}`)
      }
    }
    loadEditTx()
  }, [editTxId, supabase, customers, products])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Umum'))
    return ['Semua', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const searchTerms = search.toLowerCase().split(' ').filter(term => term.trim() !== '')

      // Match all terms (AND logic) for multi-word search
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase() === term) // Exact barcode match usually
      )

      const matchesCategory = categoryFilter === 'Semua' || (p.category || 'Umum') === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const getProductPrice = (product: Product, customer: Partial<Customer> | null) => {
    if (!customer) return product.price_retail
    if (customer.category === 'grosir' && product.price_grosir) return product.price_grosir
    if (customer.category === 'horeca' && product.price_horeca) return product.price_horeca
    return product.price_retail
  }

  useEffect(() => {
    setCart(prev => prev.map(item => ({
      ...item,
      unit_price: getProductPrice(item.product, selectedCustomer)
    })))
  }, [selectedCustomer])

  useEffect(() => {
    async function fetchShift() {
      const { data } = await supabase
        .from('cashier_shifts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .single()

      setActiveShift(data || null)
      setIsShiftLoaded(true)
    }
    fetchShift()
  }, [userId, supabase])

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
      return [...prev, { product, qty: 1, unit_price: getProductPrice(product, selectedCustomer), discount_amount: 0 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const currentQty = typeof item.qty === 'number' ? item.qty : 1
        const newQty = currentQty + delta
        if (newQty < 1) return item
        if (newQty > item.product.stock_quantity) {
          toast.error('Melebihi stok yang tersedia!')
          return item
        }
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const handleQtyChange = (productId: string, val: string) => {
    if (val === '') {
      setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: '' as any } : item))
      return
    }
    const qty = parseInt(val)
    if (isNaN(qty)) return
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (qty > item.product.stock_quantity) {
          toast.error('Melebihi stok yang tersedia!')
          return { ...item, qty: item.product.stock_quantity }
        }
        return { ...item, qty }
      }
      return item
    }))
  }

  const handleQtyBlur = (productId: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (!item.qty || (item.qty as any) < 1) return { ...item, qty: 1 }
      }
      return item
    }))
  }

  const handleDiscountChange = (productId: string, val: string) => {
    if (val === '') {
      setCart(prev => prev.map(item => item.product.id === productId ? { ...item, discount_amount: '' as any } : item))
      return
    }
    const discount = parseInt(val.replace(/\D/g, ''))
    if (isNaN(discount)) return
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, discount_amount: discount } : item))
  }

  const handleDiscountBlur = (productId: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (!item.discount_amount || (item.discount_amount as any) < 0) return { ...item, discount_amount: 0 }
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + ((item.unit_price * item.qty) - (item.discount_amount || 0)), 0)
  const taxRate = settings?.tax_percentage || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handleCheckout = async (isSaveAsOrder = false) => {
    if (cart.length === 0) return
    if (!branchId) {
      toast.error('Gagal: Cabang belum dipilih atau Anda tidak memiliki akses ke cabang ini.')
      return
    }
    if (paymentMethod === 'tempo' && !isSaveAsOrder) {
      if (!selectedCustomer) {
        toast.error('Pembayaran tempo wajib memilih pelanggan!')
        return
      }
      if (selectedCustomer.payment_terms === 'COD' || !selectedCustomer.payment_terms) {
        toast.error('Pelanggan ini tidak diizinkan menggunakan pembayaran tempo (Kategori COD).')
        return
      }
      const newDebt = (selectedCustomer.current_debt || 0) + total
      if (selectedCustomer.credit_limit && selectedCustomer.credit_limit > 0 && newDebt > selectedCustomer.credit_limit) {
        toast.error(`Melebihi batas piutang pelanggan! (Batas: ${formatRupiah(selectedCustomer.credit_limit)})`)
        return
      }
    }

    const paid = amountPaid === '' ? 0 : Number(amountPaid)
    if (paymentMethod !== 'tempo' && paid < total && !isSaveAsOrder) {
      toast.error('Nominal pembayaran kurang dari total tagihan!')
      return
    }

    setLoading(true)
    try {
      const invoiceNumber = ''
      const orderStatus = (userRole === 'sales' || isSaveAsOrder) ? 'pending' : 'completed'

      const getDueDays = (terms: string) => {
        if (!terms) return 0
        if (terms === 'NET 3') return 3
        if (terms === 'NET 5') return 5
        if (terms === 'NET 7') return 7
        if (terms === 'NET 14') return 14
        if (terms === 'NET 30') return 30
        if (terms === 'NET 60') return 60
        return 0
      }

      const dueDays = selectedCustomer?.payment_terms ? getDueDays(selectedCustomer.payment_terms) : 0

      let finalInvoiceNumber = invoiceNumber;
      let txnId = "";
      let txnCreatedAt = new Date().toISOString();

      if (editTxId) {
        finalInvoiceNumber = editInvoiceNumber || invoiceNumber;

        const { error: txnError } = await supabase
          .from('transactions')
          .update({
            customer_id: selectedCustomer?.id || null,
            subtotal,
            tax_amount: taxAmount,
            total_amount: total,
            payment_method: isSaveAsOrder ? 'tempo' : paymentMethod,
            payment_status: isSaveAsOrder ? 'piutang' : (paymentMethod === 'tempo' ? 'piutang' : 'lunas'),
            amount_paid: isSaveAsOrder ? 0 : (paymentMethod === 'tempo' ? paid : total),
            due_date: isSaveAsOrder ? null : (paymentMethod === 'tempo' ? new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString() : null),
            order_status: orderStatus,
          })
          .eq('id', editTxId)

        if (txnError) throw txnError
        txnId = editTxId;

        const { error: delError } = await supabase.from('transaction_items').delete().eq('transaction_id', editTxId)
        if (delError) throw delError

      } else {
        const { data: txn, error: txnError } = await supabase
          .from('transactions')
          .insert([{
            invoice_number: invoiceNumber,
            customer_id: selectedCustomer?.id || null,
            user_id: userId,
            subtotal,
            tax_amount: taxAmount,
            total_amount: total,
            payment_method: isSaveAsOrder ? 'tempo' : paymentMethod,
            payment_status: isSaveAsOrder ? 'piutang' : (paymentMethod === 'tempo' ? 'piutang' : 'lunas'),
            amount_paid: isSaveAsOrder ? 0 : (paymentMethod === 'tempo' ? paid : total),
            due_date: isSaveAsOrder ? null : (paymentMethod === 'tempo' ? new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString() : null),
            branch_id: branchId,
            warehouse_id: defaultWarehouseId || null,
            order_status: orderStatus
          }])
          .select('id, created_at, invoice_number')
          .single()

        if (txnError) throw txnError
        txnId = txn.id
        txnCreatedAt = txn.created_at
        finalInvoiceNumber = txn.invoice_number
      }

      const txnItems = cart.map(item => ({
        transaction_id: txnId,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        qty: item.qty,
        unit: item.product.unit,
        unit_price: item.unit_price,
        hpp_snapshot: item.product.hpp,
        discount_amount: item.discount_amount || 0,
        subtotal: (item.qty * item.unit_price) - (item.discount_amount || 0)
      }))

      const { error: itemsError } = await supabase.from('transaction_items').insert(txnItems)
      if (itemsError) throw itemsError

      if (orderStatus === 'completed' && defaultWarehouseId) {
        for (const item of cart) {
          const breakdown = (item.product as any).stock_breakdown || [];
          const currentWarehouseStock = breakdown.find((s: any) => s.warehouse_id === defaultWarehouseId)?.stock_quantity || 0;
          await supabase.from('product_stocks')
            .update({ stock_quantity: currentWarehouseStock - item.qty })
            .eq('product_id', item.product.id)
            .eq('warehouse_id', defaultWarehouseId)
        }
      }

      if (orderStatus === 'completed' && paymentMethod === 'tempo' && selectedCustomer) {
        await supabase.from('customers')
          .update({ current_debt: (selectedCustomer.current_debt || 0) + (total - paid) })
          .eq('id', selectedCustomer.id)
      }

      if (orderStatus === 'pending') {
        toast.success('Pesanan berhasil dibuat! Menunggu persetujuan kasir.')
      } else {
        toast.success('Transaksi berhasil diproses!')
      }

      // Setup Receipt Data instead of closing
      setCompletedTxn({
        id: txnId,
        invoice_number: finalInvoiceNumber,
        created_at: txnCreatedAt,
        customer: selectedCustomer,
        items: [...cart],
        subtotal,
        taxAmount,
        total,
        paymentMethod,
        amountPaid: paymentMethod === 'tempo' ? paid : paid,
        change: paymentMethod === 'tunai' ? paid - total : 0,
        debt: paymentMethod === 'tempo' ? total - paid : 0
      })

    } catch (error: any) {
      toast.error(error.message || 'Gagal memproses transaksi')
    } finally {
      setLoading(false)
    }
  }

  const startNewTransaction = () => {
    setCart([])
    setSelectedCustomer(null)
    setIsCheckoutOpen(false)
    setAmountPaid('')
    setPaymentMethod('tunai')
    setCompletedTxn(null)
    // Refresh to get latest stocks (simple solution)
    window.location.reload()
  }

  const printReceipt = () => {
    window.print()
  }

  const sendWhatsAppReceipt = () => {
    if (!completedTxn) return
    const { invoice_number, items, total, customer, paymentMethod } = completedTxn

    let text = `*${branch?.name || settings?.store_name || 'SBR Frozen'}*\n`
    text += `Faktur Penjualan\n`
    text += `No: ${invoice_number}\n`
    text += `--------------------------------\n`

    items.forEach((item: any) => {
      text += `${item.product.name}\n`
      text += `${item.qty} x ${formatRupiah(item.unit_price)}`
      if (item.discount_amount > 0) text += ` - Diskon ${formatRupiah(item.discount_amount)}`
      text += ` = ${formatRupiah((item.qty * item.unit_price) - (item.discount_amount || 0))}\n`
    })

    text += `--------------------------------\n`
    text += `Total: *${formatRupiah(total)}*\n`
    text += `Metode: ${paymentMethod.toUpperCase()}\n\n`
    text += `${settings?.receipt_footer_text || 'Terima kasih!'}\n`

    const phone = customer?.phone ? customer.phone.replace(/[^0-9]/g, '') : ''
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    
    // Auto add if it's an exact barcode scan
    if (val.trim() !== '') {
      const exactMatch = products.find(p => p.barcode === val.trim() || p.sku === val.trim())
      if (exactMatch) {
        addToCart(exactMatch)
        setSearch('')
      }
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* LEFT PANEL: PRODUCT GRID */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-dark-100 no-print">
        {/* Header & Filter Area */}
        <div className="p-4 bg-white border-b border-dark-100 flex-shrink-0 flex flex-col gap-3 z-10 shadow-sm relative">

          {/* Search Bar - Larger and more prominent */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari produk (Tekan F2) atau Scan Barcode..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-dark-200 text-lg rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-dark-900 placeholder:text-dark-400 shadow-inner"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 pb-1 sm:pb-0 w-full relative z-20">
            <Filter className="w-5 h-5 text-dark-400 flex-shrink-0 hidden sm:block" />
            <DropdownMenu.Root onOpenChange={(open) => { if (!open) setCategorySearch('') }}>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-between input py-2.5 text-sm font-medium w-full sm:max-w-[250px] bg-white border-dark-200 focus:border-primary focus:ring-primary shadow-sm rounded-xl cursor-pointer">
                  <span className="truncate">{categoryFilter === 'Semua' ? 'Semua Kategori' : categoryFilter}</span>
                  <ChevronRight className="w-4 h-4 text-dark-400 rotate-90 flex-shrink-0" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="w-[250px] max-h-[350px] flex flex-col bg-white rounded-xl shadow-2xl border border-dark-100 p-2 z-50 animate-fade-in" align="start">
                  <div className="px-2 py-2 border-b border-dark-50 mb-2">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-2">Pilih Kategori</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="input pl-9 h-9 text-sm w-full"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-1 hide-scrollbar">
                    {categories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                      <DropdownMenu.Item
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat)
                          searchInputRef.current?.focus()
                        }}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors",
                          categoryFilter === cat ? "bg-primary-50 text-primary-700 font-semibold" : "text-dark-700 hover:bg-dark-50"
                        )}
                      >
                        {cat === 'Semua' ? 'Semua Kategori' : cat}
                      </DropdownMenu.Item>
                    ))}
                    {categories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-dark-400">
                        Kategori tidak ditemukan
                      </div>
                    )}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-slate-50/50">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-100 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-dark-300" />
              </div>
              <p className="font-semibold text-dark-600">Produk tidak ditemukan</p>
              <p className="text-sm text-dark-400 mt-1">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const price = getProductPrice(product, selectedCustomer)
                const isOutOfStock = product.stock_quantity <= 0
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={cn(
                      'relative flex flex-col h-full bg-white rounded-2xl border border-dark-100 p-3.5 cursor-pointer select-none',
                      'transition-all duration-150 shadow-sm',
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed grayscale'
                        : 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary-200 active:scale-95 active:shadow-sm'
                    )}
                  >
                    <div className="flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-dark-400 font-mono mb-1 truncate">{product.sku}</p>
                        <h3 className="font-semibold text-dark-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
                      </div>
                      <div className="mt-2">
                        <p className="text-primary-600 font-bold text-money text-sm">{formatRupiah(price)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', isLowStock ? 'bg-warning' : isOutOfStock ? 'bg-danger' : 'bg-success')} />
                          <p className={cn('text-[11px] font-medium', isLowStock ? 'text-warning-700' : isOutOfStock ? 'text-danger' : 'text-dark-500')}>
                            {isOutOfStock ? 'Habis' : `${product.stock_quantity} ${product.unit}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CART */}
      <div className="w-full md:w-[400px] xl:w-[450px] bg-white flex flex-col flex-shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 no-print">

        {/* SHIFT MANAGEMENT BAR */}
        {isShiftLoaded && (
          <div className="p-3 border-b border-dark-100">
            <ShiftManagement
              userId={userId}
              branchId={branchId}
              activeShift={activeShift}
              onShiftChange={setActiveShift}
            />
          </div>
        )}

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
                      {selectedCustomer ? selectedCustomer.name : 'Pilih Pelanggan'}
                    </p>
                    <p className="text-xs text-dark-400 capitalize">
                      {selectedCustomer ? `${selectedCustomer.category} — ${selectedCustomer.payment_terms || 'COD'} (Limit: ${formatRupiah(selectedCustomer.credit_limit || 0)})` : 'Wajib dipilih'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="w-[360px] max-h-[400px] overflow-hidden flex flex-col bg-white rounded-xl shadow-2xl border border-dark-100 p-2 z-50 animate-fade-in" align="end">
                <div className="px-2 py-2 border-b border-dark-50 mb-2">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-2">Pilih Pelanggan</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Cari nama pelanggan..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="input pl-9 h-9 text-sm w-full"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  
                  {customers.filter(c => c.name?.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                    <DropdownMenu.Item
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c)
                        setCustomerSearch('')
                      }}
                      className="flex flex-col px-3 py-2 rounded-lg cursor-pointer outline-none hover:bg-dark-50 mb-1"
                    >
                      <span className="text-sm font-semibold text-dark-900">{c.name}</span>
                      <span className="text-xs text-dark-400 capitalize">{c.category} — {c.payment_terms || 'COD'} (Piutang: {formatRupiah(c.current_debt || 0)})</span>
                    </DropdownMenu.Item>
                  ))}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

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
                <div key={item.product.id} className="flex gap-3 p-3 rounded-xl border border-dark-100 bg-white hover:border-primary-200 transition-colors group items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-dark-900 line-clamp-2 pr-2">{item.product.name}</h4>
                      
                    </div>
                    
                    <p className="text-primary-600 font-bold text-money text-sm mt-1">{formatRupiah(item.unit_price)}</p>
                    
                    {/* Diskon di bawah harga */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">Diskon (Rp)</span>
                      {userRole === 'super_admin' || userRole === 'kasir' ? (
                        <input
                          type="text"
                          value={item.discount_amount as any === '' ? '' : item.discount_amount?.toLocaleString('id-ID')}
                          onChange={(e) => handleDiscountChange(item.product.id, e.target.value)}
                          onBlur={() => handleDiscountBlur(item.product.id)}
                          className="w-24 text-danger-600 font-bold text-money text-sm bg-white border border-dark-200 rounded px-2 py-1 focus:border-danger-400 focus:outline-none transition-colors h-7"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-danger-600 font-bold text-money text-sm h-7 flex items-center bg-dark-50 rounded px-2 w-24 border border-transparent">
                          {item.discount_amount ? item.discount_amount.toLocaleString('id-ID') : '-'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end h-full pt-1 pb-1">
                    <div className="flex items-center gap-1 bg-dark-50 rounded-lg p-0.5 border border-dark-100">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-dark-600 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      {userRole === 'super_admin' || userRole === 'kasir' ? (
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.product.id, e.target.value)}
                          onBlur={() => handleQtyBlur(item.product.id)}
                          className="w-12 text-center text-sm font-semibold bg-white border-y border-dark-100 focus:outline-none focus:border-primary-400 h-8 hide-arrow px-1"
                        />
                      ) : (
                        <span className="w-12 text-center text-sm font-semibold">{item.qty}</span>
                      )}
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-dark-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="mt-2 text-danger/70 hover:text-danger hover:bg-danger-light/50 w-full rounded-md py-1 flex justify-center items-center transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            onClick={() => {
              if (!selectedCustomer) {
                toast.error('Harap pilih atau cari pelanggan terlebih dahulu!')
                return
              }
              setIsCheckoutOpen(true)
              setCompletedTxn(null)
            }}
            disabled={cart.length === 0}
            className="w-full btn-lg btn-primary shadow-glow-primary text-lg h-14"
          >
            {userRole === 'sales' ? 'Buat Pesanan (SO)' : 'Proses Pesanan'}
          </button>
        </div>
      </div>

      {/* MODALS: CHECKOUT OR RECEIPT */}
      {isCheckoutOpen && (
        <div className="modal-overlay z-[100] no-print">
          <div className="modal-content max-w-xl">
            {completedTxn ? (
              // RECEIPT VIEW
              <div className="p-0">
                <div className="bg-success-light/30 p-6 border-b border-success-light text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-success-dark">
                    {userRole === 'sales' ? 'Pesanan Diajukan!' : 'Transaksi Berhasil!'}
                  </h2>
                  <p className="text-sm text-success-dark/80 mt-1">
                    {userRole === 'sales' ? 'Pesanan dalam status PENDING menunggu kasir.' : 'Stok & kas telah diupdate.'}
                  </p>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Digital Receipt Preview */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                      body * { visibility: hidden; }
                      #printable-receipt, #printable-receipt * { visibility: visible; }
                      #printable-receipt { position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; }
                    }
                  `}} />
                  <div
                    id="printable-receipt"
                    className="flex-1 bg-white border border-dark-100 p-6 rounded-xl font-mono text-sm max-w-sm mx-auto shadow-sm"
                    style={{ color: '#000' }}
                  >
                    <div className="text-center mb-4 flex flex-col items-center">
                      <img src="/logo.jpeg" alt="SBR Logo" className="h-12 object-contain mb-2" />
                      <h3 className="text-lg font-bold uppercase">{branch?.name || settings?.store_name || 'SBR Frozen'}</h3>
                      {(branch?.address || settings?.store_address) && <p className="text-[10px] mt-1">{branch?.address || settings?.store_address}</p>}
                      {(branch?.phone || settings?.store_phone) && <p className="text-[10px]">📞 {branch?.phone || settings?.store_phone}</p>}
                    </div>

                    <div className="border-t border-b border-dashed border-dark-200 py-2 mb-3 text-xs">
                      <div className="flex justify-between mb-1">
                        <span>No:</span>
                        <span>{completedTxn.invoice_number}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Tgl:</span>
                        <span>{formatDateShort(completedTxn.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pelanggan:</span>
                        <span>{completedTxn.customer ? completedTxn.customer.name : 'Umum'}</span>
                      </div>
                    </div>

                    <div className="mb-3 space-y-2">
                      {completedTxn.items.map((item: any, i: number) => (
                        <div key={i} className="text-xs">
                          <div className="font-semibold line-clamp-1">{item.product.name}</div>
                          <div className="flex justify-between mt-0.5">
                            <span>{item.qty} x {formatRupiah(item.unit_price)}</span>
                            <span>{formatRupiah(item.qty * item.unit_price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-dark-200 pt-2 mb-4 text-xs">
                      <div className="flex justify-between font-bold text-sm mb-1">
                        <span>TOTAL</span>
                        <span>{formatRupiah(completedTxn.total)}</span>
                      </div>
                      <div className="flex justify-between text-dark-500">
                        <span>BAYAR ({completedTxn.paymentMethod.toUpperCase()})</span>
                        <span>{formatRupiah(completedTxn.amountPaid)}</span>
                      </div>
                      {completedTxn.paymentMethod === 'tunai' && (
                        <div className="flex justify-between text-dark-500">
                          <span>KEMBALI</span>
                          <span>{formatRupiah(completedTxn.change)}</span>
                        </div>
                      )}
                      {completedTxn.paymentMethod === 'tempo' && (
                        <div className="flex justify-between text-dark-500">
                          <span>SISA PIUTANG</span>
                          <span>{formatRupiah(completedTxn.debt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-xs text-dark-400 mt-6">
                      <p>{settings?.receipt_footer_text || 'Terima kasih atas kunjungan Anda!'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full md:w-48 flex-shrink-0 no-print">
                    <a
                      href={`/print/invoice/${completedTxn.id}?format=thermal`}
                      target="_blank"
                      className="btn-md bg-dark-900 text-white hover:bg-dark-800 w-full justify-start border-none"
                    >
                      <Printer className="w-4 h-4" /> Print Thermal
                    </a>
                    <a
                      href={`/print/invoice/${completedTxn.id}?format=a4`}
                      target="_blank"
                      className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 w-full justify-start"
                    >
                      <FileText className="w-4 h-4" /> Print A4
                    </a>
                    <button onClick={sendWhatsAppReceipt} className="btn-md bg-[#25D366] text-white hover:bg-[#1DA851] w-full justify-start border-none">
                      <MessageCircle className="w-4 h-4" /> WA
                    </button>
                    <div className="flex-1" />
                    <button onClick={startNewTransaction} className="btn-lg btn-primary w-full">
                      Transaksi Baru
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // CHECKOUT VIEW
              <>
                <div className="flex items-center justify-between p-6 border-b border-dark-100">
                  <div>
                    <h2 className="text-xl font-bold text-dark-900">Selesaikan Pembayaran</h2>
                    <p className="text-sm text-dark-500 mt-0.5">Total Tagihan: <span className="font-bold text-primary-600">{formatRupiah(total)}</span></p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-dark-400 hover:text-dark-600">
                    <Trash2 className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-3">Pilih Metode Pembayaran</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'tunai', icon: Banknote, label: 'Uang Tunai', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      { id: 'transfer', icon: CreditCard, label: 'Transfer Bank', color: 'text-primary-500', bg: 'bg-primary-50', border: 'border-primary-200' },
                      { id: 'qris', icon: QrCode, label: 'QRIS', color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
                      { id: 'tempo', icon: Clock, label: 'Tempo (Piutang)', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                    ].map((method) => {
                      const isActive = paymentMethod === method.id
                      return (
                        <button
                          key={method.id}
                          onClick={() => {
                            setPaymentMethod(method.id as any)
                            if (method.id === 'tunai') setAmountPaid(total)
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

                  {userRole === 'sales' ? (
                    <button
                      onClick={() => handleCheckout(true)}
                      disabled={loading}
                      className="w-full btn-lg btn-primary h-14 text-lg"
                    >
                      {loading ? 'Memproses...' : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Selesaikan & Ajukan Pesanan
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckout(true)}
                        disabled={loading}
                        className="w-1/2 btn-lg bg-white border border-primary text-primary hover:bg-primary-50 h-14 text-base font-bold rounded-xl"
                      >
                        {loading ? 'Memproses...' : 'Simpan Sbg Pesanan'}
                      </button>
                      <button
                        onClick={() => handleCheckout(false)}
                        disabled={loading}
                        className="w-1/2 btn-lg btn-primary h-14 text-base font-bold rounded-xl px-2"
                      >
                        {loading ? 'Memproses...' : 'Bayar Lunas (Faktur)'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
