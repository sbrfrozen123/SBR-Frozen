'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, MoreVertical, Edit, Trash2, Tags } from 'lucide-react'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Category, UserRole } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface CategoriesClientProps {
  initialCategories: Category[]
  userRole: UserRole
}

export default function CategoriesClient({ initialCategories, userRole }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)

  const supabase = createClient()

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const searchLower = search.toLowerCase()
      return c.name.toLowerCase().includes(searchLower) || 
             (c.description && c.description.toLowerCase().includes(searchLower))
    })
  }, [categories, search])

  const refreshData = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (data) setCategories(data)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"? Data ini tidak dapat dikembalikan.`)) return
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        if (error.code === '23503') { // Foreign key violation
          throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk.')
        }
        throw error
      }
      toast.success('Kategori berhasil dihapus')
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus kategori')
    }
  }

  const openAddForm = () => {
    setEditingCategory(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Kategori Produk</h1>
          <p className="page-subtitle">Kelola klasifikasi kategori untuk pengelompokkan barang.</p>
        </div>
        {['super_admin', 'admin_gudang'].includes(userRole) && (
          <button onClick={openAddForm} className="btn-md btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Kategori
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
              placeholder="Cari nama kategori..." 
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
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                {['super_admin', 'admin_gudang'].includes(userRole) && (
                  <th className="w-12"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={['super_admin', 'admin_gudang'].includes(userRole) ? 4 : 3} className="text-center py-12 text-dark-400">
                    <Tags className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada kategori ditemukan</p>
                    <p className="text-sm">Silakan tambahkan kategori baru atau ubah kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                    <td>
                      <div className="font-semibold text-dark-900">{category.name}</div>
                    </td>
                    <td className="text-dark-600">
                      {category.description || '-'}
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
                                onClick={() => openEditForm(category)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                              >
                                <Edit className="w-4 h-4" /> Edit Kategori
                              </DropdownMenu.Item>
                              
                              {userRole === 'super_admin' && (
                                <>
                                  <DropdownMenu.Separator className="h-px bg-dark-100 my-1 mx-2" />
                                  <DropdownMenu.Item 
                                    onClick={() => handleDelete(category.id, category.name)}
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
          <div>Menampilkan <span className="font-semibold text-dark-900">{filteredCategories.length}</span> dari <span className="font-semibold text-dark-900">{categories.length}</span> kategori</div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <CategoryForm 
            initialData={editingCategory} 
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
