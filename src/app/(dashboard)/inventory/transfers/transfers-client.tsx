'use client'

import { useState } from 'react'
import { Plus, Search, Filter, ArrowRightLeft, CheckCircle2, CheckSquare, ChevronDown, X } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils/cn'

function GlobalProductSearch({ onSelect, products }: { onSelect: (val: string) => void, products: any[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div 
        className={cn("input bg-white cursor-pointer flex items-center justify-between", "text-dark-400")}
        onClick={() => setOpen(true)}
      >
        <span>-- Cari dan Tambah Produk... --</span>
        <Search className="w-4 h-4 transition-transform text-dark-400 flex-shrink-0" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dark-200 rounded-xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-dark-100 bg-slate-50 flex-shrink-0">
            <input 
              type="text" 
              autoFocus 
              className="input w-full text-sm h-9 bg-white !py-1" 
              placeholder="Ketik nama atau barcode produk..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-dark-400 text-center">Produk tidak ditemukan</div>
            ) : (
              filtered.map(p => (
                <button 
                  key={p.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 rounded-lg hover:text-primary-700 transition-colors flex flex-col"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="font-semibold truncate w-full">{p.name}</div>
                  <div className="text-dark-500 text-xs font-mono mt-0.5">{p.sku}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>}
    </div>
  )
}

interface TransfersClientProps {
  userId: string
  userRole: string
  userName: string
  branchId: string | null
  warehouses: any[]
  products: any[]
  initialTransfers: any[]
}

export default function TransfersClient({ userId, userRole, userName, branchId, warehouses, products, initialTransfers }: TransfersClientProps) {
  const [transfers, setTransfers] = useState(initialTransfers)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [receivingTransfer, setReceivingTransfer] = useState<any>(null)
  const [receiveItems, setReceiveItems] = useState<any[]>([])
  
  const supabase = createClient()

  // Form State
  const [fromWh, setFromWh] = useState('')
  const [toWh, setToWh] = useState('')
  const [items, setItems] = useState<{product_id: string, qty: number}[]>([])
  const [notes, setNotes] = useState('')

  const refreshData = async () => {
    const { data } = await supabase.from('stock_transfers')
      .select(`*, from_wh:warehouses!from_warehouse_id(name), to_wh:warehouses!to_warehouse_id(name), creator:profiles!stock_transfers_user_id_fkey(full_name), receiver:profiles!stock_transfers_received_by_fkey(full_name), items:stock_transfer_items(*, products(name, sku))`)
      .order('transfer_date', { ascending: false })
    if (data) setTransfers(data)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchId) return toast.error('Gagal: Pilih cabang spesifik di menu atas terlebih dahulu (Jangan gunakan Semua Cabang).')
    if (!fromWh || !toWh) return toast.error('Pilih gudang asal dan tujuan')
    if (fromWh === toWh) return toast.error('Gudang asal dan tujuan tidak boleh sama')
    if (items.length === 0) return toast.error('Pilih minimal 1 barang')
    
    setLoading(true)
    try {
      // CEK STOK DULU (Peringatan Stok Kosong)
      for (const item of items) {
        const { data: stockData } = await supabase.from('product_stocks').select('stock_quantity').eq('product_id', item.product_id).eq('warehouse_id', fromWh).single();
        const currentQty = stockData ? Number(stockData.stock_quantity) : 0;
        if (currentQty <= 0) {
          const product = products.find(p => p.id === item.product_id);
          throw new Error(`Stok Kosong: Produk ${product?.name || item.product_id} habis di gudang asal.`);
        }
        if (currentQty < item.qty) {
          const product = products.find(p => p.id === item.product_id);
          throw new Error(`Stok Tidak Cukup: Produk ${product?.name || item.product_id} hanya tersisa ${currentQty} di gudang asal.`);
        }
      }

      const refNo = `TRF-${Date.now()}`
      
      const { data: trf, error: trfErr } = await supabase.from('stock_transfers').insert([{
        reference_number: refNo,
        from_warehouse_id: fromWh,
        to_warehouse_id: toWh,
        user_id: userId,
        status: 'in_transit',
        notes
      }]).select().single()

      if (trfErr) throw trfErr

      const itemsToInsert = items.map(item => ({
        transfer_id: trf.id,
        product_id: item.product_id,
        qty_sent: item.qty
      }))

      const { error: itemErr } = await supabase.from('stock_transfer_items').insert(itemsToInsert)
      if (itemErr) throw itemErr

      // Deduct from source warehouse
      const adjustments = items.map(item => ({
        product_id: item.product_id,
        warehouse_id: fromWh,
        user_id: userId,
        adjustment_type: 'pengurangan',
        qty_changed: item.qty,
        reason: `Transfer Keluar ke ${warehouses.find(w=>w.id===toWh)?.name} (${refNo})`
      }))
      await supabase.from('stock_adjustments').insert(adjustments)

        // Update product_stocks for source warehouse
        for (const item of items) {
          const { data: stockData } = await supabase.from('product_stocks').select('stock_quantity').eq('product_id', item.product_id).eq('warehouse_id', fromWh).single();
          const currentQty = stockData ? Number(stockData.stock_quantity) : 0;
          if (stockData) {
            await supabase.from('product_stocks').update({ stock_quantity: currentQty - item.qty }).eq('product_id', item.product_id).eq('warehouse_id', fromWh);
          } else {
            await supabase.from('product_stocks').insert({ product_id: item.product_id, warehouse_id: fromWh, stock_quantity: -item.qty });
          }
        }

      toast.success('Transfer berhasil dibuat dan barang dikirim')
      setIsFormOpen(false)
      setFromWh('')
      setToWh('')
      setItems([])
      setNotes('')
      refreshData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat transfer')
    } finally {
      setLoading(false)
    }
  }

  const openReceiveModal = (trf: any) => {
    setReceivingTransfer(trf)
    setReceiveItems(trf.items.map((item: any) => ({
      ...item,
      qty_received: item.qty_sent
    })))
  }

  const submitReceive = async () => {
    const trf = receivingTransfer
    if (!trf) return
    if (!window.confirm('Pastikan kuantitas yang diterima sudah benar. Lanjutkan?')) return

    try {
      toast.loading('Memproses penerimaan...', { id: 'recv' })
      
      const { error } = await supabase.from('stock_transfers')
        .update({ status: 'completed', received_by: userId, receive_date: new Date().toISOString() })
        .eq('id', trf.id)
      if (error) throw error

      // Update qty_received
      for (const item of receiveItems) {
        await supabase.from('stock_transfer_items')
          .update({ qty_received: item.qty_received })
          .eq('id', item.id)
      }

      const adjustments = []
      
      for (const item of receiveItems) {
        if (item.qty_received > 0) {
           // Add to destination warehouse
           adjustments.push({
             product_id: item.product_id,
             warehouse_id: trf.to_warehouse_id,
             user_id: userId,
             adjustment_type: 'penambahan',
             qty_changed: item.qty_received,
             reason: `Terima Transfer dari ${trf.from_wh?.name} (${trf.reference_number})`
           })
        }
      }

      if (adjustments.length > 0) {
        await supabase.from('stock_adjustments').insert(adjustments)
      }

        // Update product_stocks for destination warehouse
        for (const item of receiveItems) {
          if (item.qty_received > 0) {
            const { data: stockData } = await supabase.from('product_stocks').select('stock_quantity').eq('product_id', item.product_id).eq('warehouse_id', trf.to_warehouse_id).single();
            const currentQty = stockData ? Number(stockData.stock_quantity) : 0;
            if (stockData) {
              await supabase.from('product_stocks').update({ stock_quantity: currentQty + item.qty_received }).eq('product_id', item.product_id).eq('warehouse_id', trf.to_warehouse_id);
            } else {
              await supabase.from('product_stocks').insert({ product_id: item.product_id, warehouse_id: trf.to_warehouse_id, stock_quantity: item.qty_received });
            }
          }
        }

      toast.success('Barang berhasil diterima', { id: 'recv' })
      setReceivingTransfer(null)
      refreshData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses penerimaan', { id: 'recv' })
    }
  }

  const filtered = transfers.filter(t => 
    t.reference_number.toLowerCase().includes(search.toLowerCase()) ||
    t.from_wh?.name.toLowerCase().includes(search.toLowerCase()) ||
    t.to_wh?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Transfer Stok Antar Gudang</h1>
          <p className="page-subtitle">Kirim dan terima persediaan antar cabang atau gudang.</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button onClick={() => setIsFormOpen(true)} className="btn-md btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Buat Transfer Baru
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari no. referensi atau gudang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white border-t border-dark-100">
          <table className="data-table-dense w-full relative">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-12 text-center border-l-0">No</th>
                <th>Tanggal</th>
                <th>Referensi</th>
                <th>Barang</th>
                <th>Dari Gudang</th>
                <th>Ke Gudang</th>
                <th>Status</th>
                <th>Pencatat</th>
                <th className="w-24 text-center border-r-0">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">Belum ada data transfer stok.</td>
                </tr>
              ) : filtered.map((t, index) => (
                <tr key={t.id}>
                  <td className="text-center text-dark-400 border-l-0">{index + 1}</td>
                  <td>{formatDateShort(t.transfer_date)}</td>
                  <td><span className="font-mono text-dark-900 bg-slate-50 px-2 py-1 rounded">{t.reference_number}</span></td>
                  <td>
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {t.items?.map((item: any, i: number) => (
                        <div key={i} className="text-xs flex justify-between gap-2 border-b border-dark-50 pb-1 last:border-0 last:pb-0">
                          <span className="truncate" title={item.products?.name}>{item.products?.name}</span>
                          <span className="font-semibold">{item.qty_sent}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-semibold text-danger-700">{t.from_wh?.name}</td>
                  <td className="font-semibold text-success-700">{t.to_wh?.name}</td>
                  <td>
                    {t.status === 'in_transit' && <span className="badge bg-warning-100 text-warning-700">Dikirim</span>}
                    {t.status === 'completed' && <span className="badge bg-success-100 text-success-700">Selesai</span>}
                  </td>
                  <td className="text-sm">{t.creator?.full_name}</td>
                  <td className="text-center border-r-0">
                    {(t.status === 'in_transit' && branchId === warehouses.find((w: any) => w.id === t.to_warehouse_id)?.branch_id) ? (
                      <button 
                        onClick={() => openReceiveModal(t)}
                        className="btn-sm bg-success text-white hover:bg-success-600 rounded-lg whitespace-nowrap"
                      >
                        <CheckSquare className="w-4 h-4 mr-1" /> Terima
                      </button>
                    ) : (
                      <span className="text-xs text-dark-400"><CheckCircle2 className="w-4 h-4 text-success-500 inline mr-1"/> Diterima</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="modal-overlay z-[100]">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-3xl max-h-[90vh] animate-scale-up border border-dark-200">
            <div className="px-4 py-4 border-b border-primary-700 flex justify-between items-center bg-primary-600 text-white flex-shrink-0">
              <h2 className="text-lg font-bold">Buat Transfer Baru</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2">X</button>
            </div>
            
            <form id="transfer-form" onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Dari Gudang (Asal) *</label>
                  <select value={fromWh} onChange={e=>setFromWh(e.target.value)} required className="input bg-white">
                    <option value="">-- Pilih --</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Ke Gudang (Tujuan) *</label>
                  <select value={toWh} onChange={e=>setToWh(e.target.value)} required className="input bg-white">
                    <option value="">-- Pilih --</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Pilih Barang *</label>
                <GlobalProductSearch 
                  products={products}
                  onSelect={(productId) => {
                    const existing = items.findIndex(i => i.product_id === productId)
                    if (existing >= 0) {
                      const newI = [...items]; 
                      newI[existing].qty += 1; 
                      setItems(newI)
                    } else {
                      setItems([{ product_id: productId, qty: 1 }, ...items])
                    }
                  }}
                />
                
                <div className="mt-4 space-y-2">
                  {items.length === 0 && <div className="text-sm text-center text-dark-400 py-6 border-2 border-dashed border-dark-200 rounded-xl bg-white">Belum ada barang dipilih.</div>}
                  {items.map((it, idx) => {
                    const p = products.find(prod => prod.id === it.product_id)
                    return (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 px-3 rounded-xl border border-dark-200 shadow-sm animate-fade-in">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="font-semibold text-dark-900 truncate">{p?.name}</div>
                        <div className="text-xs text-dark-500 font-mono mt-0.5">{p?.sku}</div>
                      </div>
                      <input type="number" required min={1} value={it.qty || ''} onChange={e => {
                        const newI = [...items]; newI[idx].qty = Number(e.target.value); setItems(newI)
                      }} className="input w-24 text-center bg-white h-9 !py-1" placeholder="Qty" />
                      <button type="button" onClick={() => {
                        setItems(items.filter((_, i) => i !== idx))
                      }} className="w-9 h-9 flex-shrink-0 bg-white border border-dark-200 text-danger hover:bg-danger-50 hover:border-danger-200 rounded-lg flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )})}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Catatan</label>
                <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} className="input" placeholder="Opsional..." />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-md btn-outline bg-white text-dark-700 hover:bg-dark-50">Batal</button>
              <button type="submit" form="transfer-form" disabled={loading} className="btn-md btn-primary bg-primary-600 hover:bg-primary-700 text-white border-transparent">
                {loading ? 'Memproses...' : 'Kirim Barang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receivingTransfer && (
        <div className="modal-overlay z-[100]">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-2xl max-h-[90vh] animate-scale-up border border-dark-200">
            <div className="px-4 py-4 border-b border-success-700 flex justify-between items-center bg-success-600 text-white flex-shrink-0">
              <h2 className="text-lg font-bold">Terima Stok: {receivingTransfer.reference_number}</h2>
              <button onClick={() => setReceivingTransfer(null)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2">X</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              <div className="bg-warning-50 border border-warning-200 text-warning-800 p-3 rounded-lg text-sm font-medium">
                Sesuaikan Kuantitas (Qty) barang jika barang yang diterima secara fisik berbeda dari yang dikirim.
              </div>
              <div className="space-y-3">
                {receiveItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 bg-white border border-dark-200 p-3 rounded-xl shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-dark-900 truncate">{item.products?.sku} - {item.products?.name}</div>
                      <div className="text-sm text-dark-500 mt-1">Dikirim: <span className="font-bold text-dark-700">{item.qty_sent}</span></div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-xs font-semibold text-dark-600">Qty Diterima</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={item.qty_received === '' ? '' : item.qty_received} 
                        onChange={(e) => {
                          const newItems = [...receiveItems]
                          newItems[idx].qty_received = e.target.value === '' ? '' : Number(e.target.value)
                          setReceiveItems(newItems)
                        }} 
                        className="input w-24 text-center bg-white border-primary-300 focus:border-primary-500 focus:ring-primary-500 font-bold" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-dark-100 bg-white flex justify-end gap-3 flex-shrink-0">
              <button type="button" onClick={() => setReceivingTransfer(null)} className="btn btn-outline btn-md">
                Batal
              </button>
              <button 
                type="button" 
                onClick={submitReceive}
                className="btn btn-primary btn-md bg-success hover:bg-success-600 border-success shadow-sm shadow-success/20"
              >
                Konfirmasi Terima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
