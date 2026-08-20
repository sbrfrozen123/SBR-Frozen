'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import type { Supplier, SupplierForm as SupplierFormType } from '@/types/database'

const supplierSchema = z.object({
  name: z.string().min(1, 'Nama pemasok wajib diisi'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  payment_terms: z.string().min(1, 'Tempo pembayaran wajib diisi'),
  is_active: z.boolean().default(true),
})

interface SupplierFormProps {
  initialData?: Supplier
  onSuccess: () => void
  onCancel: () => void
}

export function SupplierForm({ initialData, onSuccess, onCancel }: SupplierFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      contact_person: initialData.contact_person || '',
      phone: initialData.phone || '',
      address: initialData.address || '',
      payment_terms: initialData.payment_terms || 'COD',
      is_active: initialData.is_active,
    } : {
      payment_terms: 'COD',
      is_active: true,
    }
  })

  const onSubmit = async (data: z.infer<typeof supplierSchema>) => {
    setLoading(true)
    try {
      if (initialData) {
        const { error } = await supabase
          .from('suppliers')
          .update(data)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Data pemasok berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([data])
        if (error) throw error
        toast.success('Pemasok berhasil ditambahkan')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving supplier:', error)
      toast.error(error.message || 'Gagal menyimpan data pemasok')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-2xl max-h-[90vh] animate-scale-up border border-dark-200">
      <div className="flex items-center justify-between p-4 bg-dark-900 text-white flex-shrink-0">
        <h2 className="text-lg font-bold">
          {initialData ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}
        </h2>
        <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* INFORMASI UMUM */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-dark-100">
            <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full"></span>
              Informasi Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group md:col-span-2">
                <label className="label">Nama Perusahaan / Pemasok *</label>
                <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Cth: PT Indofood atau Toko Jaya" />
                {errors.name && <span className="text-xs text-danger mt-1">{errors.name.message}</span>}
              </div>
              
              <div className="form-group">
                <label className="label">Nama Kontak Person</label>
                <input {...register('contact_person')} className="input" placeholder="Cth: Budi" />
              </div>

              <div className="form-group">
                <label className="label">No. Handphone / WA</label>
                <input {...register('phone')} className="input" placeholder="Cth: 081234567890" />
              </div>

              <div className="form-group md:col-span-2">
                <label className="label">Alamat Lengkap</label>
                <textarea {...register('address')} rows={2} className="input resize-none" placeholder="Alamat pemasok..." />
              </div>
            </div>
          </div>

          {/* INFORMASI KEUANGAN & TAMBAHAN */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-dark-100">
            <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-warning rounded-full"></span>
              Informasi Pembelian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="label">Tempo Pembayaran (Termin)</label>
                <select {...register('payment_terms')} className={`input bg-white ${errors.payment_terms ? 'input-error' : ''}`}>
                  <option value="COD">COD (Tunai saat barang tiba)</option>
                  <option value="NET 7">Net 7 Hari</option>
                  <option value="NET 14">Net 14 Hari</option>
                  <option value="NET 30">Net 30 Hari</option>
                  <option value="NET 60">Net 60 Hari</option>
                </select>
                {errors.payment_terms && <span className="text-xs text-danger mt-1">{errors.payment_terms.message}</span>}
                <span className="text-[10px] text-dark-400 mt-1 italic">Pilih kesepakatan tempo bayar dengan pemasok ini.</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-dark-100">
              <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-primary-500 border-dark-200 focus:ring-primary-500/30" />
              <label htmlFor="is_active" className="text-sm font-medium text-dark-700 cursor-pointer">
                Akun Aktif (Dapat digunakan untuk pembelian)
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 px-6 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="supplier-form" disabled={loading} className="btn-md btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Pemasok'}
        </button>
      </div>
    </div>
  )
}
