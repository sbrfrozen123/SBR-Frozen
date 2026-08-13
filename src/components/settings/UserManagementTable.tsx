'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Users, Plus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createTeamUser } from '@/app/actions/user'

interface Profile {
  id: string
  full_name: string
  role: 'super_admin' | 'admin_gudang' | 'kasir'
  status: 'active' | 'inactive'
}

interface UserManagementTableProps {
  initialUsers: Profile[]
}

export function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'kasir' as 'super_admin' | 'admin_gudang' | 'kasir'
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
      toast.success('Peran berhasil diperbarui')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah peran')
    } finally {
      setLoadingId(null)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setLoadingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u))
      toast.success('Status berhasil diperbarui')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah status')
    } finally {
      setLoadingId(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await createTeamUser(formData)
      if (!result.success) {
        toast.error(result.error || 'Gagal membuat pengguna')
        return
      }

      toast.success('Pengguna berhasil dibuat! Silakan refresh halaman jika belum muncul.')
      setIsModalOpen(false)
      setFormData({ email: '', password: '', fullName: '', role: 'kasir' })
      // Idealnya kita memanggil server action revalidatePath, atau sekadar reload data.
      window.location.reload()
    } catch (error: any) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden animate-fade-in flex flex-col h-full relative">
      <div className="p-6 border-b border-dark-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900">Manajemen Pengguna</h2>
            <p className="text-sm text-dark-500">Atur peran dan status akses setiap karyawan.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="bg-white p-5 rounded-2xl border border-dark-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900">{user.full_name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={cn('w-2 h-2 rounded-full', user.status === 'active' ? 'bg-success' : 'bg-danger')} />
                      <span className="text-xs text-dark-400 font-medium capitalize">{user.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-50 rounded-xl p-3 space-y-3 mt-auto border border-dark-100">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-dark-500 uppercase tracking-wide">Peran (Role)</label>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={loadingId === user.id}
                    className="input py-2 text-sm bg-white"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin_gudang">Admin Gudang</option>
                    <option value="kasir">Kasir</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-dark-500 uppercase tracking-wide">Status Akses</label>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    disabled={loadingId === user.id}
                    className="input py-2 text-sm bg-white"
                  >
                    <option value="active">Aktif (Bisa Login)</option>
                    <option value="inactive">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TAMBAH KARYAWAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <h3 className="font-bold text-lg text-dark-900">Tambah Karyawan Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-dark-400 hover:text-dark-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="form-group">
                <label className="label">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="input" 
                  placeholder="Misal: Budi Santoso"
                />
              </div>

              <div className="form-group">
                <label className="label">Alamat Email (Untuk Login)</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input" 
                  placeholder="budi@sbrfrozen.com"
                />
              </div>

              <div className="form-group">
                <label className="label">Password Sementara</label>
                <input 
                  type="text" 
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="input" 
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="form-group">
                <label className="label">Peran Karyawan</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="input"
                >
                  <option value="kasir">Kasir (Bisa akses POS & Shift)</option>
                  <option value="admin_gudang">Admin Gudang (Akses Produk & Suplier)</option>
                  <option value="super_admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
