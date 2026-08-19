'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, AlertTriangle, Package, ClipboardCheck, Download, Upload, ChevronRight, Info } from 'lucide-react'
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
  branchId: string | null
  defaultWarehouseId?: string | null
  warehouses: any[]
}

export default function InventoryClient({ initialProducts, userRole, branchId, defaultWarehouseId, warehouses }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')
  const [categorySearch, setCategorySearch] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  
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
    let query = supabase.from('products').select(`
      *,
      product_stocks (
        stock_quantity, 
        min_stock_alert, 
        warehouse_id,
        warehouses!inner (id, name, branch_id)
      )
    `).order('name', { ascending: true })
    
    if (branchId) query = query.eq('product_stocks.warehouses.branch_id', branchId)
    if (warehouseFilter !== 'all') query = query.eq('product_stocks.warehouse_id', warehouseFilter)

    const { data: rawProducts } = await query
    const mapped = (rawProducts || []).map(p => {
      const stocks = p.product_stocks || []
      const totalQty = stocks.reduce((acc: number, s: any) => acc + (Number(s.stock_quantity) || 0), 0)
      const minAlert = stocks.length === 1 ? stocks[0].min_stock_alert : p.min_stock_alert
      return { ...p, stock_quantity: totalQty, min_stock_alert: minAlert, stock_breakdown: stocks }
    })
    setProducts(mapped)
  }

  // Effect to re-fetch when warehouse filter changes
  useEffect(() => {
    refreshData()
  }, [warehouseFilter])

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

  const handleExportCSV = () => {
    const headers = ['SKU', 'Nama Barang', 'Kategori', 'HPP', 'Harga Jual', 'Satuan']
    
    // Convert all products to CSV format
    const rows = products.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.hpp,
      p.price_retail,
      p.unit
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `SBR_Stok_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const rows = text.split('\n').filter(r => r.trim() !== '')
        if (rows.length <= 1) throw new Error('File CSV kosong atau hanya berisi header.')
        
        // Remove header row
        const dataRows = rows.slice(1)
        
        const productsToUpsert = dataRows.map(row => {
          // Simple CSV parser ignoring commas inside quotes
          const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g
          let matches = []
          let match
          while ((match = regex.exec(row)) !== null) {
            matches.push(match[1].replace(/(^"|"$)/g, '').replace(/""/g, '"').trim())
          }
          
          if (matches.length < 6) return null
          
          return {
            sku: matches[0],
            name: matches[1],
            category: matches[2] || 'Umum',
            hpp: parseFloat(matches[3] || '0'),
            price_retail: parseFloat(matches[4] || '0'),
            unit: matches[5] || 'Pcs',
            is_active: true
          }
        }).filter(Boolean) as any[]

        if (productsToUpsert.length === 0) throw new Error('Format CSV tidak valid atau tidak ada data.')

        const { error } = await supabase.from('products').upsert(productsToUpsert, { onConflict: 'sku' })
        if (error) throw error
        
        toast.success(`Berhasil memproses ${productsToUpsert.length} data produk!`)
        refreshData()
      } catch (err: any) {
        toast.error(err.message || 'Gagal memproses file CSV.')
      } finally {
        setIsImporting(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Database Stok & Inventaris</h1>
          <p className="page-subtitle">Kelola katalog produk, harga, dan pantau ketersediaan stok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <input type="file" id="import-csv" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <button onClick={() => document.getElementById('import-csv')?.click()} disabled={isImporting} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Upload className="w-4 h-4" />
            {isImporting ? 'Memproses...' : 'Import'}
          </button>
          <button onClick={handleExportCSV} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="w-px h-6 bg-dark-200 hidden sm:block mx-1" />
          <button onClick={() => setIsAdjustmentModalOpen(true)} className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 whitespace-nowrap">
            <ClipboardCheck className="w-4 h-4" />
            Penyesuaian Stok
          </button>
          <button onClick={openAddForm} className="btn-md btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Barang Baru
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
          <div className="flex items-center gap-2 pb-1 sm:pb-0 w-full sm:w-auto relative">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0 hidden sm:block" />
            <DropdownMenu.Root onOpenChange={(open) => { if (!open) setCategorySearch('') }}>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-between input py-2 text-sm font-medium w-full sm:w-[200px] bg-white border-dark-200 focus:border-primary shadow-sm rounded-lg cursor-pointer">
                  <span className="truncate">{categoryFilter === 'Semua' ? 'Semua Kategori' : categoryFilter}</span>
                  <ChevronRight className="w-4 h-4 text-dark-400 rotate-90 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="w-[220px] max-h-[300px] flex flex-col bg-white rounded-xl shadow-lg border border-dark-100 p-2 z-50 animate-fade-in" align="start">
                  <div className="px-2 py-2 border-b border-dark-50 mb-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input 
                        type="text" 
                        placeholder="Cari kategori..." 
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="input pl-9 h-8 text-xs w-full"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-1 hide-scrollbar">
                    {categories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                      <DropdownMenu.Item 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors",
                          categoryFilter === cat ? "bg-primary-50 text-primary-700 font-semibold" : "text-dark-700 hover:bg-dark-50"
                        )}
                      >
                        {cat === 'Semua' ? 'Semua Kategori' : cat}
                      </DropdownMenu.Item>
                    ))}
                    {categories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-dark-400">
                        Kategori tidak ditemukan
                      </div>
                    )}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            {/* WAREHOUSE FILTER */}
            {warehouses && warehouses.length > 0 && (
              <div className="flex items-center gap-2 pb-1 sm:pb-0 w-full sm:w-auto relative">
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="input py-2 text-sm font-medium w-full sm:w-[200px] bg-white border-dark-200 focus:border-primary shadow-sm rounded-lg"
                >
                  <option value="all">Semua Gudang</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} {wh.branches?.name ? `(${wh.branches.name})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white border-t border-dark-100">
          <table className="data-table-dense w-full relative">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-12 text-center border-l-0">No</th>
                <th>ID / PLU</th>
                <th>Info Produk</th>
                <th>Kategori</th>
                <th>Barcode</th>
                <th className="text-right">HPP</th>
                <th className="text-right">Harga Jual</th>
                <th className="text-right">Stok Aktif</th>
                <th className="text-right">Min. Stok</th>
                <th className="text-right">Nilai Stok</th>
                <th className="text-center">Status</th>
                <th className="w-10 text-center border-r-0">#</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">
                    <Package className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada produk ditemukan</p>
                    <p className="text-sm">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className={product.stock_quantity <= product.min_stock_alert ? 'bg-danger-light/20' : ''}>
                    <td className="text-center text-dark-400 border-l-0">{index + 1}</td>
                    <td>
                      <div className="text-sm font-mono text-dark-900 bg-slate-50 px-2 py-1 rounded inline-block">{product.sku}</div>
                    </td>
                    <td>
                      <div className="text-dark-900 truncate max-w-[200px] sm:max-w-xs font-semibold">{product.name}</div>
                    </td>
                    <td>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{product.category || 'Umum'}</span>
                    </td>
                    <td>
                      <div className="text-sm font-mono text-dark-600">{product.barcode || '-'}</div>
                    </td>
                    <td className="text-right text-money text-dark-700">
                      {formatRupiah(product.hpp)}
                    </td>
                    <td className="text-right text-money font-semibold text-dark-900">
                      {formatRupiah(product.price_retail)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.stock_quantity <= product.min_stock_alert && (
                          <span title="Stok Menipis!"><AlertTriangle className="w-4 h-4 text-warning" /></span>
                        )}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              'font-bold',
                              product.stock_quantity <= 0 ? 'text-danger' : 
                              product.stock_quantity <= product.min_stock_alert ? 'text-warning-dark' : 'text-dark-900'
                            )}>
                              {product.stock_quantity}
                            </span>
                            <span className="text-[10px] text-dark-400 uppercase tracking-wider">{product.unit}</span>
                            
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="text-primary-600 hover:bg-primary-50 p-0.5 rounded cursor-pointer outline-none ml-1">
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content className="min-w-[200px] bg-white rounded-xl shadow-lg border border-dark-100 p-2 z-50 animate-fade-in" align="end" sideOffset={5}>
                                  <div className="text-xs font-bold text-dark-800 mb-2 px-1 border-b border-dark-50 pb-2">Rincian Stok per Gudang</div>
                                  {(product as any).stock_breakdown?.map((stk: any) => (
                                    <div key={stk.warehouse_id} className="flex justify-between items-center text-xs py-1.5 px-1 border-b border-dark-50/50 last:border-0">
                                      <span className="text-dark-600">{stk.warehouses?.name || 'Gudang'}</span>
                                      <span className="font-bold text-dark-900 bg-slate-50 px-2 py-0.5 rounded">{stk.stock_quantity}</span>
                                    </div>
                                  ))}
                                  {(!(product as any).stock_breakdown || (product as any).stock_breakdown.length === 0) && (
                                    <div className="text-xs text-dark-400 text-center py-3 bg-slate-50 rounded-lg border border-dashed border-dark-200 mt-1">Belum ada alokasi stok gudang</div>
                                  )}
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="text-dark-600 font-medium">{product.min_stock_alert}</span>
                    </td>
                    <td className="text-right text-dark-700 font-medium">
                      {formatRupiah(product.hpp * product.stock_quantity)}
                    </td>
                    <td className="text-center">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase font-bold', product.is_active ? 'bg-success-light/30 text-success-700' : 'bg-danger-light/30 text-danger-700')}>
                        {product.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="border-r-0 text-center">
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
            warehouseId={defaultWarehouseId || undefined}
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
            branchId={branchId}
            warehouseId={defaultWarehouseId}
            warehouses={warehouses}
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
