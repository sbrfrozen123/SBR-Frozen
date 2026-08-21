'use client'

import { useState, useEffect } from 'react'
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
  payment_account: z.string().nullable().optional(),
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


  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      category: initialData.category,
      amount: initialData.amount,
      payment_method: (initialData.payment_method === 'tempo' ? 'tunai' : initialData.payment_method) || 'tunai',
      description: initialData.description || '',
      expense_date: initialData.expense_date,
      payment_account: initialData.payment_account,
    } : {
      category: 'operasional',
      amount: 0,
      payment_method: 'tunai',
      expense_date: new Date().toISOString().split('T')[0],
      }
  })

  const [banks, setBanks] = useState<string[]>([])
  const paymentMethod = watch('payment_method')

  useEffect(() => {
    const query = branchId
      ? supabase.from('branches').select('bank_name_1, bank_name_2').eq('id', branchId).single()
      : supabase.from('branches').select('bank_name_1, bank_name_2').limit(1).single()
    
    query.then(({data}) => {
      if(data) {
        const b: string[] = []
        if (data.bank_name_1) b.push(data.bank_name_1)
        if (data.bank_name_2) b.push(data.bank_name_2)
        setBanks(b)
        if(b.length > 0 && !initialData?.payment_account) setValue('payment_account', b[0])
      }
    })
  }, [branchId, supabase, setValue, initialData])

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

      
      if (data.payment_method === 'tunai') {
        data.payment_account = null
      }
      let finalBranchId = branchId;
      if (!finalBranchId) {
        // Fallback to first branch if branchId is null/empty
        const { data: firstBranch } = await supabase.from('branches').select('id').limit(1).single();
        if (firstBranch) {
          finalBranchId = firstBranch.id;
        } else {
          throw new Error('Tidak ada cabang yang tersedia. Buat cabang terlebih dahulu.');
        }
      }

      const payload = {
        ...data,
        user_id: userId,
        branch_id: finalBranchId,
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
    <div className="modal-overlay z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-scale-up border border-dark-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-700 bg-primary-600 text-white flex-shrink-0">
          <h2 className="text-lg font-bold">
            {initialData ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
          </h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-md p-1 px-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-dark-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide mb-2">Rincian Pengeluaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="label">Tanggal Pengeluaran *</label>
                <input type="date" {...register('expense_date')} className={`input ${errors.expense_date ? 'input-error' : ''}`} required />
                {errors.expense_date && <span className="text-xs text-danger mt-1">{errors.expense_date.message}</span>}
              </div>

              <div className="form-group">
                <label className="label">Kategori *</label>
                <select {...register('category')} className="input bg-white">
                  <option value="operasional">Operasional (Listrik, Air, dll)</option>
                  <option value="logistik">Logistik (Ongkir, BBM, dll)</option>
                  <option value="sdm">SDM (Gaji, Lembur, dll)</option>
                  <option value="lain-lain">Lain-lain</option>
                </select>
              </div>

              {(paymentMethod === 'transfer' || paymentMethod === 'qris') && banks.length > 0 && (
                <div className="form-group md:col-span-2">
                  <label className="label">Pilih Rekening Tujuan *</label>
                  <select {...register('payment_account')} className="input bg-white font-medium text-blue-700">
                    {banks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="label">Nominal (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                  <input type="number" {...register('amount')} className={`input pl-10 ${errors.amount ? 'input-error' : ''}`} placeholder="0" />
                </div>
                {errors.amount && <span className="text-xs text-danger mt-1">{errors.amount.message}</span>}
              </div>

              <div className="form-group">
                <label className="label">Sumber Dana (Metode) *</label>
                <select {...register('payment_method')} className="input bg-white">
                  <option value="tunai">Tunai (Laci Kasir)</option>
                  <option value="transfer">Transfer (Bank)</option>
                  <option value="qris">QRIS (Bank)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Keterangan / Deskripsi *</label>
              <textarea {...register('description')} rows={2} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Cth: Bayar listrik bulan Agustus..." />
              {errors.description && <span className="text-xs text-danger mt-1">{errors.description.message}</span>}
            </div>
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

      <div className="px-6 py-4 border-t border-dark-200 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white text-dark-700 hover:bg-dark-50">
          Batal
        </button>
        <button type="submit" form="expense-form" disabled={loading} className="btn-md btn-primary bg-primary-600 hover:bg-primary-700 text-white border-transparent">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initialData ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
        </button>
      </div>
    </div>
  </div>
  )
}
