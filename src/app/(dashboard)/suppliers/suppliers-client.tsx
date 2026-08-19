'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit, Trash2, Truck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SupplierForm } from '@/components/suppliers/SupplierForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Supplier, UserRole } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface SuppliersClientProps {
  initialSuppliers: Supplier[]
  userRole: UserRole
}

export default function SuppliersClient({ initialSuppliers, userRole }: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined)

  const supabase = createClient()

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const searchLower = search.toLowerCase()
      return s.name.toLowerCase().includes(searchLower) || 
             (s.phone && s.phone.toLowerCase().includes(searchLower)) ||
             (s.contact_person && s.contact_person.toLowerCase().includes(searchLower))
    })
  }, [suppliers, search])

  const refreshData = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name', { ascending: true })
    if (data) setSuppliers(data)
  }

  // Fetch on mount for CSR speed optimization
  useEffect(() => {
    refreshData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pemasok "${name}"? Data ini tidak dapat dikembalikan.`)) return
    
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id)
      if (error) throw error
      toast.success('Pemasok berhasil dihapus')
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus pemasok')
    }
  }

  const openAddForm = () => {
    setEditingSupplier(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Pemasok (Suppliers)</h1>
          <p className="page-subtitle">Kelola data pemasok barang untuk keperluan restock inventory.</p>
        </div>
        {['super_admin', 'admin_gudang'].includes(userRole) && (
          <button onClick={openAddForm} className="btn-md btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Pemasok
          </button>
        )}
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari nama pemasok atau no. telp..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Nama Pemasok</th>
                <th>Kontak Person</th>
                <th>No. Telp</th>
                <th className="text-center">Status</th>
                {['super_admin', 'admin_gudang'].includes(userRole) && (
                  <th className="w-12"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={['super_admin', 'admin_gudang'].includes(userRole) ? 6 : 5} className="text-center py-12 text-dark-400">
                    <Truck className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada pemasok ditemukan</p>
                    <p className="text-sm">Silakan tambahkan pemasok baru atau ubah kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <tr key={supplier.id}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                    <td>
                      <div className="font-semibold text-dark-900">{supplier.name}</div>
                      {supplier.address && (
                        <div className="text-xs text-dark-400 mt-0.5 max-w-[250px] truncate" title={supplier.address}>
                          {supplier.address}
                        </div>
                      )}
                    </td>
                    <td className="text-dark-700">
                      {supplier.contact_person || '-'}
                    </td>
                    <td className="text-dark-600 text-sm font-mono">
                      {supplier.phone || '-'}
                    </td>
                    <td className="text-center">
                      <span className={cn('badge', supplier.is_active ? 'badge-success' : 'badge-danger')}>
                        {supplier.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    {['super_admin', 'admin_gudang'].includes(userRole) && (
                      <td>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:bg-dark-100 hover:text-dark-900 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="min-w-[160px] bg-white rounded-xl shadow-lg border border-dark-100 p-1 z-50 animate-fade-in" align="end">
                              <DropdownMenu.Item 
                                onClick={() => openEditForm(supplier)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                              >
                                <Edit className="w-4 h-4" /> Edit Pemasok
                              </DropdownMenu.Item>
                              
                              {userRole === 'super_admin' && (
                                <>
                                  <DropdownMenu.Separator className="h-px bg-dark-100 my-1 mx-2" />
                                  <DropdownMenu.Item 
                                    onClick={() => handleDelete(supplier.id, supplier.name)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg cursor-pointer outline-none transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Hapus
                                  </DropdownMenu.Item>
                                </>
                              )}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-dark-100 bg-dark-50 flex items-center justify-between text-xs text-dark-500 flex-shrink-0">
          <div>Menampilkan <span className="font-semibold text-dark-900">{filteredSuppliers.length}</span> dari <span className="font-semibold text-dark-900">{suppliers.length}</span> pemasok</div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <SupplierForm 
            initialData={editingSupplier} 
            onSuccess={() => {
              setIsFormOpen(false)
              refreshData()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
