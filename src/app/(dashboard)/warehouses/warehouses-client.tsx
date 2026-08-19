'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, MapPin, Building, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Warehouse {
  id: string
  branch_id: string | null
  name: string
  address: string | null
  is_active: boolean
  branches?: { id: string, name: string } | null
}

interface WarehousesClientProps {
  initialWarehouses: Warehouse[]
  branches: any[]
}

export default function WarehousesClient({ initialWarehouses, branches }: WarehousesClientProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [branchId, setBranchId] = useState('')
  const [isActive, setIsActive] = useState(true)

  const supabase = createClient()

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    (w.address && w.address.toLowerCase().includes(search.toLowerCase())) ||
    (w.branches?.name && w.branches.name.toLowerCase().includes(search.toLowerCase()))
  )

  const refreshData = async () => {
    const { data } = await supabase
      .from('warehouses')
      .select(`*, branches(id, name)`)
      .order('name', { ascending: true })
    if (data) setWarehouses(data as any[])
  }

  const openForm = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse)
      setName(warehouse.name)
      setAddress(warehouse.address || '')
      setBranchId(warehouse.branch_id || '')
      setIsActive(warehouse.is_active)
    } else {
      setEditingWarehouse(null)
      setName('')
      setAddress('')
      setBranchId('')
      setIsActive(true)
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Nama gudang wajib diisi')

    setLoading(true)
    try {
      const payload = {
        name,
        address,
        branch_id: branchId || null,
        is_active: isActive
      }

      if (editingWarehouse) {
        const { error } = await supabase.from('warehouses').update(payload).eq('id', editingWarehouse.id)
        if (error) throw error
        toast.success('Gudang berhasil diperbarui')
      } else {
        const { error } = await supabase.from('warehouses').insert([payload])
        if (error) throw error
        toast.success('Gudang berhasil ditambahkan')
      }
      setIsFormOpen(false)
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus gudang ${name}?`)) return
    try {
      const { error } = await supabase.from('warehouses').delete().eq('id', id)
      if (error) throw error
      toast.success('Gudang dihapus')
      refreshData()
    } catch (error: any) {
      toast.error('Gagal menghapus: Gudang mungkin masih memiliki stok barang.')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 tracking-tight">Manajemen Gudang</h1>
          <p className="text-dark-500 mt-1">Kelola data gudang dan alokasi cabang.</p>
        </div>
        <button onClick={() => openForm()} className="btn btn-primary btn-md flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Tambah Gudang</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-dark-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input 
            type="text" 
            placeholder="Cari nama gudang, cabang, atau alamat..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map(w => (
          <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${w.is_active ? 'bg-primary-50 text-primary-600' : 'bg-dark-50 text-dark-400'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900 text-lg leading-tight">{w.name}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${w.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <Activity className="w-3 h-3" />
                      {w.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <MapPin className="w-4 h-4 shrink-0 text-dark-400" />
                  <span className="truncate">{w.address || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <Building className="w-4 h-4 shrink-0 text-dark-400" />
                  <span>Cabang: <strong className="text-dark-900">{w.branches?.name || 'Pusat (Independen)'}</strong></span>
                </div>
              </div>
            </div>
            <div className="border-t border-dark-50 bg-dark-50/50 p-3 flex justify-end gap-2">
              <button onClick={() => openForm(w)} className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-500 hover:bg-dark-100 hover:text-primary-600 transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(w.id, w.name)} className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-2xl border border-dark-100 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-dark-400" />
          </div>
          <h3 className="text-lg font-bold text-dark-900 mb-1">Gudang Tidak Ditemukan</h3>
          <p className="text-dark-500 max-w-sm mx-auto">Silakan tambah gudang baru atau ubah kata kunci pencarian Anda.</p>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50/50">
              <h2 className="text-lg font-bold text-dark-900">{editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang Baru'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="form-group">
                <label className="label">Nama Gudang *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="input" 
                  placeholder="Cth: Gudang Utama / Gudang Cabang A" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="label">Tautkan ke Cabang</label>
                <select value={branchId} onChange={e => setBranchId(e.target.value)} className="input">
                  <option value="">-- Pusat / Independen --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">Kosongkan jika ini adalah gudang pusat yang tidak menempel pada cabang toko tertentu.</p>
              </div>

              <div className="form-group">
                <label className="label">Alamat Lengkap</label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="input min-h-[80px]" 
                  placeholder="Alamat gudang..." 
                />
              </div>

              <label className="flex items-center gap-3 p-3 border border-dark-200 rounded-xl cursor-pointer hover:bg-dark-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-300 text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-dark-900">Status Gudang Aktif</div>
                  <div className="text-xs text-dark-500">Gudang yang tidak aktif tidak dapat digunakan untuk transaksi atau transfer stok.</div>
                </div>
              </label>

              <div className="flex gap-3 pt-4 border-t border-dark-100">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Menyimpan...' : 'Simpan Gudang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
