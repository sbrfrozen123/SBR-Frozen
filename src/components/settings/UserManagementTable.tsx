'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Users, Plus, X, Loader2, ShieldCheck, Info, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createTeamUser, updateTeamUserPassword } from '@/app/actions/user'

interface Profile {
  id: string
  full_name: string
  role: 'super_admin' | 'admin_gudang' | 'kasir' | 'sales'
  status: 'active' | 'inactive'
  branch_id: string | null
  branch?: { name: string } | null
}

interface UserManagementTableProps {
  initialUsers: Profile[]
  initialBranches: any[]
}

export function UserManagementTable({ initialUsers, initialBranches }: UserManagementTableProps) {
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
    role: 'kasir' as 'super_admin' | 'admin_gudang' | 'kasir' | 'sales',
    branch_id: initialBranches[0]?.id || ''
  })
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    role: 'kasir' as 'super_admin' | 'admin_gudang' | 'kasir' | 'sales',
    branch_id: '',
    status: 'active' as 'active' | 'inactive',
    password: ''
  })

  const openEditModal = (user: Profile) => {
    setEditingUser(user)
    setEditFormData({
      fullName: user.full_name,
      role: user.role,
      branch_id: user.branch_id || '',
      status: user.status,
      password: ''
    })
    setIsEditModalOpen(true)
  }

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

  const handleBranchChange = async (userId: string, newBranchId: string) => {
    setLoadingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ branch_id: newBranchId })
        .eq('id', userId)

      if (error) throw error
      
      const newBranchName = initialBranches.find(b => b.id === newBranchId)?.name
      setUsers(users.map(u => u.id === userId ? { ...u, branch_id: newBranchId, branch: { name: newBranchName || '' } } : u))
      toast.success('Cabang berhasil diperbarui')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah cabang')
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
      setFormData({ email: '', password: '', fullName: '', role: 'kasir', branch_id: initialBranches[0]?.id || '' })
      // Idealnya kita memanggil server action revalidatePath, atau sekadar reload data.
      window.location.reload()
    } catch (error: any) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmitting(true)
    
    try {
      // Update profile
      const updates = {
        full_name: editFormData.fullName,
        role: editFormData.role,
        branch_id: editFormData.role === 'super_admin' ? null : (editFormData.branch_id || null),
        status: editFormData.status
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', editingUser.id)

      if (error) throw error

      // Update password if provided
      if (editFormData.password.trim() !== '') {
        const passResult = await updateTeamUserPassword(editingUser.id, editFormData.password)
        if (!passResult.success) {
          toast.error(passResult.error || 'Gagal mengubah password, tapi profil berhasil diperbarui')
        }
      }

      toast.success('Pengguna berhasil diperbarui!')
      setIsEditModalOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui pengguna')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden animate-fade-in flex flex-col h-full relative">
      <div className="p-6 border-b border-dark-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900">Manajemen Pengguna</h2>
            <p className="text-sm text-dark-500">Atur peran dan status akses setiap karyawan.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-white flex flex-col xl:flex-row">
        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto border-r border-dark-100">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Karyawan</th>
                <th>Role</th>
                <th>Cabang</th>
                <th>Status</th>
                <th className="text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-dark-900">{user.full_name}</div>
                        <div className="text-xs text-dark-400">ID: {user.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={loadingId === user.id}
                      className="input py-1 px-2 text-sm bg-dark-50 h-8 font-medium w-auto min-w-[140px]"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin_gudang">Admin Gudang</option>
                      <option value="kasir">Kasir</option>
                      <option value="sales">Sales Canvassing</option>
                    </select>
                  </td>
                  <td>
                    {user.role === 'super_admin' ? (
                      <span className="text-xs text-dark-400 italic">Semua Cabang</span>
                    ) : (
                      <select
                        value={user.branch_id || ''}
                        onChange={(e) => handleBranchChange(user.id, e.target.value)}
                        disabled={loadingId === user.id}
                        className="input py-1 px-2 text-sm bg-dark-50 h-8 w-auto min-w-[140px]"
                      >
                        <option value="">Pilih Cabang...</option>
                        {initialBranches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      disabled={loadingId === user.id}
                      className={cn(
                        "input py-1 px-2 text-xs font-bold h-8 w-auto min-w-[120px] uppercase",
                        user.status === 'active' ? 'bg-success-light/20 text-success-700' : 'bg-danger-light/20 text-danger-700'
                      )}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => openEditModal(user)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors mx-auto"
                      title="Edit Pengguna"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-dark-400">Belum ada karyawan yang terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ROLE PERMISSIONS PANEL */}
        <div className="w-full xl:w-80 bg-slate-50 p-6 flex-shrink-0 flex flex-col gap-4 border-t xl:border-t-0 border-dark-100">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-dark-900">Daftar Hak Akses</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-xl border border-dark-100 shadow-sm">
              <h4 className="font-bold text-sm text-dark-900 mb-1">Super Admin</h4>
              <p className="text-xs text-dark-500 leading-relaxed">Hak akses penuh ke seluruh fitur sistem, termasuk menghapus transaksi, melihat laporan keuangan, dan mengelola pengguna lain.</p>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-dark-100 shadow-sm">
              <h4 className="font-bold text-sm text-dark-900 mb-1">Admin Gudang</h4>
              <p className="text-xs text-dark-500 leading-relaxed">Fokus pada manajemen inventaris (stok barang), kategori, pemasok, dan pencatatan restock pembelian. Tidak bisa melihat laporan keuangan.</p>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-dark-100 shadow-sm">
              <h4 className="font-bold text-sm text-dark-900 mb-1">Kasir</h4>
              <p className="text-xs text-dark-500 leading-relaxed">Akses ke aplikasi Kasir (POS) dan manajemen Shift. Bertugas melakukan transaksi penjualan langsung di toko fisik.</p>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-dark-100 shadow-sm">
              <h4 className="font-bold text-sm text-dark-900 mb-1">Sales Canvassing</h4>
              <p className="text-xs text-dark-500 leading-relaxed">Hanya bisa membuat Sales Order (SO) dan melihat daftar pelanggan di lapangan. Tidak bisa mengubah stok langsung secara sepihak.</p>
            </div>
          </div>
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
                className="btn text-dark-400 hover:text-dark-600 transition-colors"
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
                  <option value="sales">Sales (Buat SO / Canvassing)</option>
                  <option value="admin_gudang">Admin Gudang (Akses Produk & Suplier)</option>
                  <option value="super_admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              {formData.role !== 'super_admin' && (
                <div className="form-group">
                  <label className="label">Tugaskan ke Cabang</label>
                  <select 
                    value={formData.branch_id}
                    onChange={e => setFormData({...formData, branch_id: e.target.value})}
                    className="input"
                  >
                    {initialBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline btn-md"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary btn-md min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KARYAWAN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <h3 className="font-bold text-lg text-dark-900">Edit Karyawan</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="btn text-dark-400 hover:text-dark-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
              <div className="form-group">
                <label className="label">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.fullName}
                  onChange={e => setEditFormData({...editFormData, fullName: e.target.value})}
                  className="input" 
                />
              </div>

              <div className="form-group">
                <label className="label">Password Baru (Opsional)</label>
                <input 
                  type="text" 
                  minLength={6}
                  value={editFormData.password}
                  onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                  className="input" 
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Peran Karyawan</label>
                  <select 
                    value={editFormData.role}
                    onChange={e => setEditFormData({...editFormData, role: e.target.value as any})}
                    className="input"
                  >
                    <option value="kasir">Kasir</option>
                    <option value="sales">Sales</option>
                    <option value="admin_gudang">Admin Gudang</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Status Akses</label>
                  <select 
                    value={editFormData.status}
                    onChange={e => setEditFormData({...editFormData, status: e.target.value as any})}
                    className="input"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              {editFormData.role !== 'super_admin' && (
                <div className="form-group">
                  <label className="label">Tugaskan ke Cabang</label>
                  <select 
                    value={editFormData.branch_id}
                    onChange={e => setEditFormData({...editFormData, branch_id: e.target.value})}
                    className="input"
                  >
                    <option value="">Pilih Cabang...</option>
                    {initialBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-outline btn-md"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary btn-md min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
