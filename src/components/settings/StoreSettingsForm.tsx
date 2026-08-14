'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, Store, Save, Upload, X } from 'lucide-react'
import type { StoreSettings } from '@/types/database'

interface StoreSettingsFormProps {
  initialData: StoreSettings | null
}

export function StoreSettingsForm({ initialData }: StoreSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.logo_url || null)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    store_name: initialData?.store_name || 'SBR Frozen',
    store_address: initialData?.store_address || '',
    store_phone: initialData?.store_phone || '',
    tax_percentage: initialData?.tax_percentage || 0,
    receipt_footer_text: initialData?.receipt_footer_text || 'Terima kasih telah berbelanja di SBR Frozen',
    logo_url: initialData?.logo_url || '',
    social_instagram: initialData?.social_instagram || '',
    store_website: initialData?.store_website || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'tax_percentage' ? Number(value) : value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setPreviewUrl(null)
    setFormData(prev => ({ ...prev, logo_url: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalLogoUrl = formData.logo_url

      // Handle file upload
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `logo-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(`settings/${fileName}`, logoFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(`settings/${fileName}`)
          
        finalLogoUrl = publicUrlData.publicUrl
      } else if (!previewUrl) {
        finalLogoUrl = '' // user removed the logo
      }

      const dataToSave = { ...formData, logo_url: finalLogoUrl }

      if (initialData?.id) {
        // Update
        const { error } = await supabase
          .from('store_settings')
          .update(dataToSave)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('store_settings')
          .insert([dataToSave])
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

        <div className="border-t border-dark-100 pt-5 mt-5">
          <h3 className="text-sm font-bold text-dark-900 mb-4">Media Sosial & Logo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group md:col-span-2">
              <label className="label">Logo Toko</label>
              
              <div className="flex items-start gap-6">
                {/* Preview Area */}
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-dark-200 bg-dark-50 flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={handleRemoveLogo}
                          className="w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <Store className="w-8 h-8 text-dark-300" />
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1">
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="btn-outline border-2 border-dashed border-primary-200 text-primary-700 hover:bg-primary-50 py-3 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Pilih File Gambar Logo
                    </div>
                  </div>
                  <p className="text-xs text-dark-400 mt-2">Disarankan gambar berbentuk persegi (1:1) dengan format PNG/JPG. Maksimal 2MB.</p>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Username Instagram</label>
              <input 
                type="text" 
                name="social_instagram"
                value={formData.social_instagram}
                onChange={handleChange}
                className="input" 
                placeholder="@sbr_frozen"
              />
            </div>
            <div className="form-group">
              <label className="label">Website / Link Lainnya</label>
              <input 
                type="text" 
                name="store_website"
                value={formData.store_website}
                onChange={handleChange}
                className="input" 
                placeholder="www.sbrfrozen.com"
              />
            </div>
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
