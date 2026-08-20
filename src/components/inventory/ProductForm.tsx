'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import type { Product, ProductForm as ProductFormType } from '@/types/database'

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  sku: z.string().min(1, 'SKU wajib diisi'),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  hpp: z.coerce.number().min(0, 'HPP tidak boleh negatif'),
  price_retail: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  price_grosir: z.coerce.number().min(0).optional(),
  price_horeca: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().min(0, 'Stok awal tidak boleh negatif'),
  min_stock_alert: z.coerce.number().min(0, 'Minimum stok tidak boleh negatif'),
  is_active: z.boolean().default(true),
})

interface ProductFormProps {
  initialData?: Product
  warehouseId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ initialData, warehouseId, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [units, setUnits] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('id, name').order('name')
      if (catData) setCategories(catData)
      
      const { data: unitData } = await supabase.from('units').select('id, name').order('name')
      if (unitData) setUnits(unitData)
    }
    fetchData()
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category || 'Umum',
      sku: initialData.sku,
      barcode: initialData.barcode || '',
      unit: initialData.unit,
      hpp: initialData.hpp,
      price_retail: initialData.price_retail,
      price_grosir: initialData.price_grosir || 0,
      price_horeca: initialData.price_horeca || 0,
      stock_quantity: initialData.stock_quantity,
      min_stock_alert: initialData.min_stock_alert,
      is_active: initialData.is_active,
    } : {
      sku: 'PRD' + Math.floor(100000 + Math.random() * 900000).toString(),
      barcode: '',
      category: 'Umum',
      unit: 'Pcs',
      hpp: 0,
      price_retail: 0,
      price_grosir: 0,
      price_horeca: 0,
      stock_quantity: 0,
      min_stock_alert: 0,
      is_active: true,
    }
  })

  const onSubmit = async (data: ProductFormType) => {
    setLoading(true)
    try {
      if (initialData) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', initialData.id)
        if (error) throw error
        
        // Also update product_stocks if warehouseId exists
        if (warehouseId) {
          const { error: stockError } = await supabase
            .from('product_stocks')
            .upsert({
              product_id: initialData.id,
              warehouse_id: warehouseId,
              stock_quantity: data.stock_quantity,
              min_stock_alert: data.min_stock_alert
            }, { onConflict: 'product_id, warehouse_id' })
          if (stockError) throw stockError
        }
        
        toast.success('Produk berhasil diperbarui')
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([data])
          .select()
          .single()
        if (error) throw error
        
        // Update initial stock in product_stocks (row already created by trigger) if warehouseId exists
        if (warehouseId && newProduct) {
          const { error: stockError } = await supabase
            .from('product_stocks')
            .update({
              stock_quantity: data.stock_quantity,
              min_stock_alert: data.min_stock_alert
            })
            .eq('product_id', newProduct.id)
            .eq('warehouse_id', warehouseId)
          if (stockError) throw stockError
        }
        
        toast.success('Produk berhasil ditambahkan')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Gagal menyimpan produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-dark-200">
        <div className="flex items-center justify-between px-4 py-4 border-b border-dark-200 bg-dark-900 text-white flex-shrink-0">
          <h2 className="text-lg font-bold">
            {initialData ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section: Informasi Dasar */}
          <div>
            <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Nama Produk *</label>
                <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Cth: Fiesta Chicken Nugget 500g" />
                {errors.name && <span className="text-xs text-danger mt-1">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">SKU (Kode Barang) *</label>
                <input {...register('sku')} className={`input ${errors.sku ? 'input-error' : ''}`} placeholder="Cth: FCN-500" />
                {errors.sku && <span className="text-xs text-danger mt-1">{errors.sku.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Barcode</label>
                <input {...register('barcode')} className={`input ${errors.barcode ? 'input-error' : ''}`} placeholder="Scan atau ketik barcode..." />
                {errors.barcode && <span className="text-xs text-danger mt-1">{errors.barcode.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Kategori</label>
                <select {...register('category')} className={`input ${errors.category ? 'input-error' : ''}`}>
                  <option value="">Pilih Kategori...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Umum">Umum</option>
                </select>
                {errors.category && <span className="text-xs text-danger mt-1">{errors.category.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Satuan</label>
                <select {...register('unit')} className={`input ${errors.unit ? 'input-error' : ''}`}>
                  <option value="">Pilih Satuan...</option>
                  {units.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                  <option value="Pcs">Pcs</option>
                  <option value="Kg">Kg</option>
                </select>
                {errors.unit && <span className="text-xs text-danger mt-1">{errors.unit.message}</span>}
              </div>
            </div>
          </div>

          <div className="border-t border-dark-100" />

          {/* Section: Harga */}
          <div>
            <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-4">Harga Pokok & Jual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Harga Pokok Penjualan (HPP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('hpp')} className={`input pl-10 ${errors.hpp ? 'input-error' : ''}`} />
                </div>
                {errors.hpp && <span className="text-xs text-danger mt-1">{errors.hpp.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Harga Jual *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('price_retail')} className={`input pl-10 ${errors.price_retail ? 'input-error' : ''}`} />
                </div>
                {errors.price_retail && <span className="text-xs text-danger mt-1">{errors.price_retail.message}</span>}
              </div>
            </div>
          </div>

          <div className="border-t border-dark-100" />

          {/* Section: Stok */}
          <div>
            <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-4">Pengaturan Stok</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">StokTersedia *</label>
                <input type="number" step="0.01" {...register('stock_quantity')} className={`input ${errors.stock_quantity ? 'input-error' : ''}`} />
                {errors.stock_quantity && <span className="text-xs text-danger mt-1">{errors.stock_quantity.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Batas Minimum Stok (Warning)</label>
                <input type="number" step="0.01" {...register('min_stock_alert')} className={`input ${errors.min_stock_alert ? 'input-error' : ''}`} />
                {errors.min_stock_alert && <span className="text-xs text-danger mt-1">{errors.min_stock_alert.message}</span>}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-primary-500 border-dark-200 focus:ring-primary-500/30" />
              <label htmlFor="is_active" className="text-sm font-medium text-dark-700 cursor-pointer">
                Produk Aktif (Tampil di Penjualan)
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white text-dark-700 hover:bg-dark-50">
          Batal
        </button>
        <button type="submit" form="product-form" disabled={loading} className="btn-md btn-primary bg-primary-600 hover:bg-primary-700 text-white border-transparent">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Produk'}
        </button>
      </div>
    </div>
  </div>
  )
}
