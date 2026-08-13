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
    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-dark-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-dark-900">
          {initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h2>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-6">
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

      <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="category-form" disabled={loading} className="btn-md btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
        </button>
      </div>
    </div>
  )
}
