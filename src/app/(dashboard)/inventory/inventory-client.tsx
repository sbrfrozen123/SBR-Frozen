'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, AlertTriangle, Package, ClipboardCheck } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { ProductForm } from '@/components/inventory/ProductForm'
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Product, UserRole } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface InventoryClientProps {
  initialProducts: Product[]
  userRole: UserRole
}

export default function InventoryClient({ initialProducts, userRole }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua')
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const supabase = createClient()

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Umum'))
    return ['Semua', ...Array.from(cats)]
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'Semua' || (p.category || 'Umum') === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const refreshData = async () => {
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true })
    if (data) setProducts(data)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}"? Data ini tidak dapat dikembalikan.`)) return
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast.success('Produk berhasil dihapus')
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus produk')
    }
  }

  const openAddForm = () => {
    setEditingProduct(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Database Stok & Inventaris</h1>
          <p className="page-subtitle">Kelola katalog produk, harga, dan pantau ketersediaan stok.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button onClick={() => setIsAdjustmentModalOpen(true)} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50">
            <ClipboardCheck className="w-4 h-4" />
            Penyesuaian Stok
          </button>
          <button onClick={openAddForm} className="btn-md btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari nama produk atau SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  categoryFilter === cat 
                    ? 'bg-dark-900 text-white' 
                    : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Info Produk</th>
                <th>Kategori</th>
                <th className="text-right">HPP</th>
                <th className="text-right">Harga Retail</th>
                <th className="text-right">Stok</th>
                <th className="text-center">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-400">
                    <Package className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada produk ditemukan</p>
                    <p className="text-sm">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className={product.stock_quantity <= product.min_stock_alert ? 'bg-danger-light/20' : ''}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                    <td>
                      <div className="font-semibold text-dark-900">{product.name}</div>
                      <div className="text-xs text-dark-400 font-mono mt-0.5">{product.sku}</div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{product.category || 'Umum'}</span>
                    </td>
                    <td className="text-right text-money text-dark-600">
                      {formatRupiah(product.hpp)}
                    </td>
                    <td className="text-right text-money font-semibold text-primary-600">
                      {formatRupiah(product.price_retail)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.stock_quantity <= product.min_stock_alert && (
                          <span title="Stok Menipis!"><AlertTriangle className="w-4 h-4 text-warning" /></span>
                        )}
                        <span className={cn(
                          'font-semibold text-money',
                          product.stock_quantity <= 0 ? 'text-danger' : 
                          product.stock_quantity <= product.min_stock_alert ? 'text-warning-dark' : 'text-dark-900'
                        )}>
                          {product.stock_quantity}
                        </span>
                        <span className="text-xs text-dark-400">{product.unit}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={cn('badge', product.is_active ? 'badge-success' : 'badge-danger')}>
                        {product.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
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
                              onClick={() => openEditForm(product)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Edit Produk
                            </DropdownMenu.Item>
                            
                            {userRole === 'super_admin' && (
                              <>
                                <DropdownMenu.Separator className="h-px bg-dark-100 my-1 mx-2" />
                                <DropdownMenu.Item 
                                  onClick={() => handleDelete(product.id, product.name)}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-dark-100 bg-dark-50 flex items-center justify-between text-xs text-dark-500 flex-shrink-0">
          <div>Menampilkan <span className="font-semibold text-dark-900">{filteredProducts.length}</span> dari <span className="font-semibold text-dark-900">{products.length}</span> total produk</div>
          <div>Total Nilai Aset: <span className="font-semibold text-dark-900 text-money">{formatRupiah(products.reduce((acc, p) => acc + (p.hpp * p.stock_quantity), 0))}</span></div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={() => {
              setIsFormOpen(false)
              refreshData()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}

      {/* Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="modal-overlay">
          <StockAdjustmentModal 
            products={products}
            onSuccess={() => {
              setIsAdjustmentModalOpen(false)
              refreshData()
            }}
            onCancel={() => setIsAdjustmentModalOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
