'use client'

import { useState } from 'react'
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
  unit: z.string().min(1, 'Satuan wajib diisi'),
  hpp: z.coerce.number().min(0, 'HPP tidak boleh negatif'),
  price_retail: z.coerce.number().min(0, 'Harga jual retail tidak boleh negatif'),
  price_grosir: z.coerce.number().min(0).optional(),
  price_horeca: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().min(0, 'Stok awal tidak boleh negatif'),
  min_stock_alert: z.coerce.number().min(0, 'Minimum stok tidak boleh negatif'),
  is_active: z.boolean().default(true),
})

interface ProductFormProps {
  initialData?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category || 'Umum',
      sku: initialData.sku,
      unit: initialData.unit,
      hpp: initialData.hpp,
      price_retail: initialData.price_retail,
      price_grosir: initialData.price_grosir || 0,
      price_horeca: initialData.price_horeca || 0,
      stock_quantity: initialData.stock_quantity,
      min_stock_alert: initialData.min_stock_alert,
      is_active: initialData.is_active,
    } : {
      category: 'Umum',
      unit: 'Pcs',
      hpp: 0,
      price_retail: 0,
      price_grosir: 0,
      price_horeca: 0,
      stock_quantity: 0,
      min_stock_alert: 5,
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
        toast.success('Produk berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data])
        if (error) throw error
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
    <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-dark-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-dark-900">
          {initialData ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
                <label className="label">Kategori</label>
                <input {...register('category')} className={`input ${errors.category ? 'input-error' : ''}`} placeholder="Cth: Nugget" />
                {errors.category && <span className="text-xs text-danger mt-1">{errors.category.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Satuan</label>
                <input {...register('unit')} className={`input ${errors.unit ? 'input-error' : ''}`} placeholder="Cth: Pcs, Kg, Dus" />
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
                <label className="label">Harga Jual Retail *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('price_retail')} className={`input pl-10 ${errors.price_retail ? 'input-error' : ''}`} />
                </div>
                {errors.price_retail && <span className="text-xs text-danger mt-1">{errors.price_retail.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Harga Jual Grosir</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('price_grosir')} className={`input pl-10 ${errors.price_grosir ? 'input-error' : ''}`} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Harga Jual Horeca</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('price_horeca')} className={`input pl-10 ${errors.price_horeca ? 'input-error' : ''}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-100" />

          {/* Section: Stok */}
          <div>
            <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-4">Pengaturan Stok</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Stok Tersedia *</label>
                <input type="number" step="0.01" {...register('stock_quantity')} className={`input ${errors.stock_quantity ? 'input-error' : ''}`} />
                {errors.stock_quantity && <span className="text-xs text-danger mt-1">{errors.stock_quantity.message}</span>}
              </div>
              <div className="form-group">
                <label className="label">Batas Minimum Stok (Alert) *</label>
                <input type="number" step="0.01" {...register('min_stock_alert')} className={`input ${errors.min_stock_alert ? 'input-error' : ''}`} />
                {errors.min_stock_alert && <span className="text-xs text-danger mt-1">{errors.min_stock_alert.message}</span>}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-primary-500 border-dark-200 focus:ring-primary-500/30" />
              <label htmlFor="is_active" className="text-sm font-medium text-dark-700 cursor-pointer">
                Produk Aktif (Tampil di POS Kasir)
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="product-form" disabled={loading} className="btn-md btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Produk'}
        </button>
      </div>
    </div>
  )
}
