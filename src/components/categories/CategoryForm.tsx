'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import type { Category } from '@/types/database'

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional(),
})

interface CategoryFormProps {
  initialData?: Category
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
    } : {}
  })

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    setLoading(true)
    try {
      if (initialData) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', initialData.id)
        if (error) throw error

        // Cascade update products if category name changed
        if (data.name !== initialData.name) {
          const { error: prodError } = await supabase
            .from('products')
            .update({ category: data.name })
            .eq('category', initialData.name)
          
          if (prodError) {
            console.error('Error updating products category:', prodError)
            // We don't throw here to not fail the whole operation, but maybe we should?
          }
        }
        
        toast.success('Data kategori berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([data])
        if (error) {
          if (error.code === '23505') {
            throw new Error('Kategori dengan nama ini sudah ada.')
          }
          throw error
        }
        toast.success('Kategori berhasil ditambahkan')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'Gagal menyimpan data kategori')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay z-50">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh] animate-scale-up border border-dark-200">
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-700 bg-primary-600 text-white flex-shrink-0">
          <h2 className="text-lg font-bold">
            {initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Nama Kategori *</label>
            <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Cth: Daging Ayam" />
            {errors.name && <span className="text-xs text-danger mt-1">{errors.name.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="label">Deskripsi Kategori</label>
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Deskripsi singkat tentang kategori ini..." />
          </div>
        </form>
      </div>

        <div className="px-6 py-4 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white text-dark-700 hover:bg-dark-50">
            Batal
          </button>
          <button type="submit" form="category-form" disabled={loading} className="btn-md btn-primary bg-primary-600 hover:bg-primary-700 text-white border-transparent">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {initialData ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
          </button>
        </div>
      </div>
    </div>
  )
}
