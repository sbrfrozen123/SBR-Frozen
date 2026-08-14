'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import type { Customer, CustomerForm as CustomerFormType } from '@/types/database'

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.enum(['retail', 'grosir', 'horeca']),
  credit_limit: z.coerce.number().min(0, 'Limit piutang tidak boleh negatif'),
  payment_terms: z.string().min(1, 'Tempo pembayaran wajib diisi'),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
})

interface CustomerFormProps {
  initialData?: Customer
  onSuccess: () => void
  onCancel: () => void
}

export function CustomerForm({ initialData, onSuccess, onCancel }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      phone: initialData.phone || '',
      address: initialData.address || '',
      category: initialData.category,
      credit_limit: initialData.credit_limit,
      payment_terms: initialData.payment_terms || 'COD',
      notes: initialData.notes || '',
      is_active: initialData.is_active,
    } : {
      category: 'retail',
      credit_limit: 0,
      payment_terms: 'COD',
      is_active: true,
    }
  })

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    setLoading(true)
    try {
      if (initialData) {
        const { error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Data pelanggan berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([data])
        if (error) throw error
        toast.success('Pelanggan berhasil ditambahkan')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving customer:', error)
      toast.error(error.message || 'Gagal menyimpan data pelanggan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-dark-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-dark-900">
          {initialData ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
        </h2>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* INFORMASI UMUM */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-dark-100">
            <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full"></span>
              Informasi Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group md:col-span-2">
                <label className="label">Nama Lengkap / Instansi *</label>
                <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Cth: Budi Santoso atau Restoran Sedap" />
                {errors.name && <span className="text-xs text-danger mt-1">{errors.name.message}</span>}
              </div>
              
              <div className="form-group">
                <label className="label">No. Handphone / WA</label>
                <input {...register('phone')} className="input" placeholder="Cth: 081234567890" />
              </div>

              <div className="form-group">
                <label className="label">Kategori Pelanggan *</label>
                <select {...register('category')} className="input bg-white">
                  <option value="retail">Retail (Eceran)</option>
                  <option value="grosir">Grosir</option>
                  <option value="horeca">HoReCa (Hotel/Resto/Cafe)</option>
                </select>
              </div>

              <div className="form-group md:col-span-2">
                <label className="label">Alamat Lengkap</label>
                <textarea {...register('address')} rows={2} className="input resize-none" placeholder="Alamat pengiriman..." />
              </div>
            </div>
          </div>

          {/* INFORMASI KEUANGAN */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-dark-100">
            <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-warning rounded-full"></span>
              Informasi Keuangan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Batas Piutang (Credit Limit)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('credit_limit')} className={`input pl-10 ${errors.credit_limit ? 'input-error' : ''}`} />
                </div>
                {errors.credit_limit && <span className="text-xs text-danger mt-1">{errors.credit_limit.message}</span>}
                <span className="text-[10px] text-dark-400 mt-1 italic">Set 0 jika tidak boleh kasbon.</span>
              </div>

              <div className="form-group">
                <label className="label">Tempo Pembayaran (Termin)</label>
                <select {...register('payment_terms')} className={`input bg-white ${errors.payment_terms ? 'input-error' : ''}`}>
                  <option value="COD">COD (Tunai saat terima)</option>
                  <option value="NET 7">Net 7 Hari</option>
                  <option value="NET 14">Net 14 Hari</option>
                  <option value="NET 30">Net 30 Hari</option>
                  <option value="NET 60">Net 60 Hari</option>
                </select>
                {errors.payment_terms && <span className="text-xs text-danger mt-1">{errors.payment_terms.message}</span>}
              </div>
            </div>
          </div>

          {/* INFORMASI TAMBAHAN */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-dark-100">
            <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-dark-400 rounded-full"></span>
              Informasi Tambahan
            </h3>
            <div className="form-group mb-4">
              <label className="label">Catatan Tambahan</label>
              <input {...register('notes')} className="input" placeholder="Preferensi atau info lainnya..." />
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-dark-100">
              <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-primary-500 border-dark-200 focus:ring-primary-500/30" />
              <label htmlFor="is_active" className="text-sm font-medium text-dark-700 cursor-pointer">
                Akun Aktif (Dapat melakukan transaksi)
              </label>
            </div>
          </div>


        </form>
      </div>

      <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="customer-form" disabled={loading} className="btn-md btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Pelanggan'}
        </button>
      </div>
    </div>
  )
}
