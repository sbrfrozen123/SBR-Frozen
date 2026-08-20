'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Edit, Trash2, Loader2, MapPin, Plus, Save, Store, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Branch } from '@/types/database'

interface BranchManagementTableProps {
  initialBranches: Branch[]
}

export function BranchManagementTable({ initialBranches }: BranchManagementTableProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    instagram: '',
    is_active: true
  })

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        instagram: branch.instagram || '',
        is_active: branch.is_active
      })
    } else {
      setEditingBranch(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        instagram: '',
        is_active: true
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBranch(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Nama cabang harus diisi')

    setLoading(true)
    try {
      if (editingBranch) {
        // Update
        const { data, error } = await supabase
          .from('branches')
          .update(formData)
          .eq('id', editingBranch.id)
          .select()
          .single()
        
        if (error) throw error
        setBranches(prev => prev.map(b => b.id === editingBranch.id ? data : b))
        toast.success('Cabang berhasil diperbarui')
      } else {
        // Insert
        const { data, error } = await supabase
          .from('branches')
          .insert([formData])
          .select()
          .single()
        
        if (error) throw error
        setBranches(prev => [...prev, data])
        toast.success('Cabang berhasil ditambahkan')
      }
      handleCloseModal()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data cabang')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus cabang ${name}?`)) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setBranches(prev => prev.filter(b => b.id !== id))
      toast.success('Cabang berhasil dihapus')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus cabang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-dark-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900">Manajemen Cabang</h2>
            <p className="text-sm text-dark-500">Kelola daftar cabang toko Anda.</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Cabang
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-50 text-dark-500 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6 border-b border-dark-100">Nama Cabang</th>
              <th className="p-4 border-b border-dark-100">Alamat</th>
              <th className="p-4 border-b border-dark-100">Status</th>
              <th className="p-4 pr-6 border-b border-dark-100 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 text-sm text-dark-700">
            {branches.map(branch => (
              <tr key={branch.id} className="hover:bg-dark-50/50 transition-colors">
                <td className="p-4 pl-6 font-medium text-dark-900">
                  {branch.name}
                </td>
                <td className="p-4 max-w-xs truncate" title={branch.address || ''}>
                  {branch.address || '-'}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    branch.is_active ? "bg-success-light text-success" : "bg-dark-100 text-dark-600"
                  )}>
                    {branch.is_active ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenModal(branch)}
                    className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Cabang"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch.id, branch.name)}
                    className="p-2 text-dark-400 hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                    title="Hapus Cabang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-dark-500">
                  Belum ada cabang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {isModalOpen && (
      <div className="modal-overlay z-[100]">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh] animate-scale-up border border-dark-200">
          <div className="px-4 py-4 border-b border-dark-200 flex justify-between items-center bg-dark-900 text-white flex-shrink-0">
            <h2 className="text-lg font-bold">
              {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
            </h2>
            <button 
              onClick={handleCloseModal}
              className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2"
            >
              X
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <form id="branch-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="label">Nama Cabang *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="input"
                  required
                  placeholder="Misal: Cabang Sudirman"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Telepon</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  className="input"
                  placeholder="0812..."
                />
              </div>

              <div className="form-group">
                <label className="label">Instagram Cabang</label>
                <input 
                  type="text" 
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({...prev, instagram: e.target.value}))}
                  className="input"
                  placeholder="@sbrfrozen.cabang"
                />
              </div>

              <div className="form-group">
                <label className="label">Alamat Lengkap</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                  className="input min-h-[80px] resize-none"
                  placeholder="Jl. Sudirman No..."
                />
              </div>

              <div className="form-group">
                <label className="label flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                    className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                  />
                  Status Cabang Aktif
                </label>
              </div>

            </form>
          </div>

          <div className="p-4 px-6 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button 
              type="button" 
              onClick={handleCloseModal}
              className="btn btn-outline btn-md bg-white"
              disabled={loading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              form="branch-form"
              className="btn btn-primary btn-md min-w-[120px]"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
