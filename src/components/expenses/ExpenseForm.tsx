'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X, UploadCloud, FileText } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { Expense } from '@/types/database'

const expenseSchema = z.object({
  category: z.enum(['operasional', 'logistik', 'sdm', 'lain-lain']),
  amount: z.coerce.number().min(1, 'Nominal pengeluaran wajib diisi dan > 0'),
  payment_method: z.enum(['tunai', 'transfer', 'qris']),
  description: z.string().min(1, 'Keterangan pengeluaran wajib diisi'),
  expense_date: z.string(),
})

interface ExpenseFormProps {
  initialData?: Expense
  userId: string
  branchId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ExpenseForm({ initialData, userId, branchId, onSuccess, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      category: initialData.category,
      amount: initialData.amount,
      payment_method: (initialData.payment_method === 'tempo' ? 'tunai' : initialData.payment_method) || 'tunai',
      description: initialData.description || '',
      expense_date: initialData.expense_date,
    } : {
      category: 'operasional',
      amount: 0,
      payment_method: 'tunai',
      expense_date: new Date().toISOString().split('T')[0],
    }
  })

  const uploadReceipt = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return filePath
  }

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    setLoading(true)
    try {
      let receipt_url = initialData?.receipt_url

      if (file) {
        toast.loading('Mengunggah bukti pengeluaran...', { id: 'upload' })
        receipt_url = await uploadReceipt(file)
        toast.dismiss('upload')
      }

      const payload = {
        ...data,
        user_id: userId,
        branch_id: branchId,
        receipt_url
      }

      if (initialData) {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Pengeluaran berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([payload])
        if (error) throw error
        toast.success('Pengeluaran berhasil dicatat')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving expense:', error)
      toast.error(error.message || 'Gagal menyimpan pengeluaran')
      toast.dismiss('upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-dark-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-dark-900">
          {initialData ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
        </h2>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="form-group">
            <label className="label">Tanggal Pengeluaran *</label>
            <input type="date" {...register('expense_date')} className={`input ${errors.expense_date ? 'input-error' : ''}`} required />
            {errors.expense_date && <span className="text-xs text-danger mt-1">{errors.expense_date.message}</span>}
          </div>

          <div className="form-group">
            <label className="label">Kategori *</label>
            <select {...register('category')} className="input bg-white">
              <option value="operasional">Operasional (Listrik, Air, Internet, dll)</option>
              <option value="logistik">Logistik (Ongkir, BBM, Plastik, dll)</option>
              <option value="sdm">SDM (Gaji, Lembur, Konsumsi, dll)</option>
              <option value="lain-lain">Lain-lain</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Nominal (Rp) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
              <input type="number" {...register('amount')} className={`input pl-10 ${errors.amount ? 'input-error' : ''}`} />
            </div>
            {errors.amount && <span className="text-xs text-danger mt-1">{errors.amount.message}</span>}
          </div>

          <div className="form-group">
            <label className="label">Sumber Dana (Metode Pembayaran) *</label>
            <select {...register('payment_method')} className="input bg-white">
              <option value="tunai">Tunai (Laci Kasir)</option>
              <option value="transfer">Transfer (Rekening Bank)</option>
              <option value="qris">QRIS (Rekening Bank)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Keterangan / Deskripsi *</label>
            <textarea {...register('description')} rows={3} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Cth: Bayar listrik bulan Agustus..." />
            {errors.description && <span className="text-xs text-danger mt-1">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label className="label">Bukti Pengeluaran (Opsional)</label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-200 border-dashed rounded-xl hover:bg-dark-50 transition-colors relative">
              <div className="space-y-1 text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="mx-auto h-12 w-12 text-primary-500" />
                    <p className="text-sm font-medium text-dark-900 mt-2">{file.name}</p>
                    <p className="text-xs text-dark-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={() => setFile(null)} className="text-xs text-danger hover:underline mt-2">Hapus file</button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-dark-400" />
                    <div className="flex text-sm text-dark-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Pilih File</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-dark-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
            {initialData?.receipt_url && !file && (
              <p className="text-xs text-dark-500 mt-2">
                * Dokumen bukti sebelumnya sudah tersimpan. Upload file baru untuk menggantinya.
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="expense-form" disabled={loading} className="btn-md btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
        </button>
      </div>
    </div>
  )
}
