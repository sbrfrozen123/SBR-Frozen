'use client'

import { useState } from 'react'
import { Plus, Search, Filter, ArrowRightLeft, CheckCircle2, CheckSquare, ChevronDown, X } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils/cn'

function SearchableProductSelect({ value, onChange, products }: { value: string, onChange: (val: string) => void, products: any[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedProduct = products.find(p => p.id === value);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative flex-1 min-w-[200px]">
      <div 
        className={cn("input bg-white cursor-pointer flex items-center justify-between", !selectedProduct && "text-dark-400")}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selectedProduct ? `${selectedProduct.sku} - ${selectedProduct.name}` : '-- Pilih Produk --'}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform text-dark-400 flex-shrink-0", open ? "rotate-180" : "")} />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dark-200 rounded-xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-dark-100 bg-slate-50 flex-shrink-0">
            <input 
              type="text" 
              autoFocus 
              className="input w-full text-sm h-9 bg-white" 
              placeholder="Cari SKU atau Nama..." 
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
                    onChange(p.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="font-semibold">{p.sku}</div>
                  <div className="text-dark-500 text-xs truncate">{p.name}</div>
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
    if (!fromWh || !toWh) return toast.error('Pilih gudang asal dan tujuan')
    if (fromWh === toWh) return toast.error('Gudang asal dan tujuan tidak boleh sama')
    if (items.length === 0) return toast.error('Pilih minimal 1 barang')
    
    setLoading(true)
    try {
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

  const handleReceive = async (trfId: string, fromId: string, toId: string, refNo: string, trfItems: any[]) => {
    if (!window.confirm('Terima barang ini ke gudang tujuan?')) return
    try {
      toast.loading('Memproses penerimaan...', { id: 'recv' })
      
      const { error } = await supabase.from('stock_transfers')
        .update({ status: 'completed', received_by: userId, receive_date: new Date().toISOString() })
        .eq('id', trfId)
      if (error) throw error

      // Update qty_received
      for (const item of trfItems) {
        await supabase.from('stock_transfer_items')
          .update({ qty_received: item.qty_sent })
          .eq('id', item.id)
      }

      // Add to destination warehouse
      const adjustments = trfItems.map(item => ({
        product_id: item.product_id,
        warehouse_id: toId,
        user_id: userId,
        adjustment_type: 'penambahan',
        qty_changed: item.qty_sent,
        reason: `Terima Transfer dari ${warehouses.find(w=>w.id===fromId)?.name} (${refNo})`
      }))
      await supabase.from('stock_adjustments').insert(adjustments)

      toast.success('Barang berhasil diterima', { id: 'recv' })
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
                    {t.status === 'in_transit' ? (
                      <button 
                        onClick={() => handleReceive(t.id, t.from_warehouse_id, t.to_warehouse_id, t.reference_number, t.items)}
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
                <label className="label flex justify-between items-center">
                  <span>Pilih Barang *</span>
                  <button type="button" onClick={() => setItems([...items, {product_id: '', qty: 1}])} className="text-xs text-primary-600 hover:underline">
                    + Tambah Baris
                  </button>
                </label>
                <div className="space-y-2 border border-dark-200 rounded-xl p-4 bg-dark-50">
                  {items.length === 0 && <div className="text-sm text-center text-dark-400 py-4">Belum ada barang dipilih. Klik + Tambah Baris</div>}
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <SearchableProductSelect
                        value={it.product_id}
                        products={products}
                        onChange={(val) => {
                          const newI = [...items]; newI[idx].product_id = val; setItems(newI)
                        }}
                      />
                      <input type="number" required min={1} value={it.qty || ''} onChange={e => {
                        const newI = [...items]; newI[idx].qty = Number(e.target.value); setItems(newI)
                      }} className="input w-24 text-center bg-white" placeholder="Qty" />
                      <button type="button" onClick={() => {
                        setItems(items.filter((_, i) => i !== idx))
                      }} className="w-10 h-10 flex-shrink-0 bg-white border border-dark-200 text-danger hover:bg-danger-50 hover:border-danger-200 rounded-xl flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
    </div>
  )
}
