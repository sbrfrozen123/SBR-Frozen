'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, Store, Save } from 'lucide-react'
import type { StoreSettings } from '@/types/database'

interface StoreSettingsFormProps {
  initialData: StoreSettings | null
}

export function StoreSettingsForm({ initialData }: StoreSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    store_name: initialData?.store_name || 'SBR Frozen',
    store_address: initialData?.store_address || '',
    store_phone: initialData?.store_phone || '',
    tax_percentage: initialData?.tax_percentage || 0,
    receipt_footer_text: initialData?.receipt_footer_text || 'Terima kasih telah berbelanja di SBR Frozen',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'tax_percentage' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (initialData?.id) {
        // Update
        const { error } = await supabase
          .from('store_settings')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('store_settings')
          .insert([formData])
        if (error) throw error
      }
      toast.success('Pengaturan toko berhasil disimpan!')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-dark-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-dark-900">Profil Toko</h2>
          <p className="text-sm text-dark-500">Informasi ini akan ditampilkan di nota/struk cetak.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-group">
            <label className="label">Nama Toko *</label>
            <input 
              type="text" 
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              className="input" 
              required
            />
          </div>
          
          <div className="form-group">
            <label className="label">No. Telepon</label>
            <input 
              type="text" 
              name="store_phone"
              value={formData.store_phone}
              onChange={handleChange}
              className="input" 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Alamat Lengkap</label>
          <textarea 
            name="store_address"
            value={formData.store_address}
            onChange={handleChange}
            className="input min-h-[80px] resize-none" 
            placeholder="Jl. Raya SBR No. 123..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-group">
            <label className="label">Catatan di Bawah Struk (Footer)</label>
            <input 
              type="text" 
              name="receipt_footer_text"
              value={formData.receipt_footer_text}
              onChange={handleChange}
              className="input" 
              placeholder="Terima kasih..."
            />
          </div>
          
          <div className="form-group">
            <label className="label">Pajak / PPN (%)</label>
            <input 
              type="number" 
              step="0.01"
              name="tax_percentage"
              value={formData.tax_percentage}
              onChange={handleChange}
              className="input" 
              min="0"
              max="100"
            />
            <p className="text-xs text-dark-400 mt-1">Kosongkan atau isi 0 jika tidak ada pajak.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary btn-lg min-w-[150px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              <>
                <Save className="w-5 h-5" />
                Simpan Profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
