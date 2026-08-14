'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Users } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Customer, UserRole } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface CustomersClientProps {
  initialCustomers: Customer[]
  userRole: UserRole
}

export default function CustomersClient({ initialCustomers, userRole }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua')
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)

  const supabase = createClient()

  // Extract unique categories
  const categories = ['Semua', 'retail', 'grosir', 'horeca']

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const searchLower = search.toLowerCase()
      const matchesSearch = c.name.toLowerCase().includes(searchLower) || 
                            (c.phone && c.phone.toLowerCase().includes(searchLower))
      const matchesCategory = categoryFilter === 'Semua' || c.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [customers, search, categoryFilter])

  const refreshData = async () => {
    const { data } = await supabase.from('customers').select('*').order('name', { ascending: true })
    if (data) setCustomers(data)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"? Data ini tidak dapat dikembalikan.`)) return
    
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id)
      if (error) throw error
      toast.success('Pelanggan berhasil dihapus')
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus pelanggan')
    }
  }

  const openAddForm = () => {
    setEditingCustomer(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Database Customer</h1>
          <p className="page-subtitle">Kelola data pelanggan, kategori (retail/grosir/horeca), dan batas piutang.</p>
        </div>
        <button onClick={openAddForm} className="btn-md btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Customer
        </button>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau no. telp..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize',
                  categoryFilter === cat 
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20' 
                    : 'bg-dark-50 text-dark-600 hover:bg-dark-100 hover:text-dark-900'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Nama Pelanggan</th>
                <th>Kategori</th>
                <th>Kontak</th>
                <th className="text-right">Batas Piutang</th>
                <th className="text-right">Piutang Berjalan</th>
                <th className="text-center">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-400">
                    <Users className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada pelanggan ditemukan</p>
                    <p className="text-sm">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                    <td>
                      <div className="font-semibold text-dark-900">{customer.name}</div>
                      {customer.address && (
                        <div className="text-xs text-dark-400 mt-0.5 max-w-[200px] truncate" title={customer.address}>
                          {customer.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={cn(
                        'badge capitalize',
                        customer.category === 'retail' ? 'badge-primary' :
                        customer.category === 'grosir' ? 'badge-accent' : 'badge-warning'
                      )}>
                        {customer.category}
                      </span>
                    </td>
                    <td className="text-dark-600 text-sm font-mono">
                      {customer.phone || '-'}
                    </td>
                    <td className="text-right text-dark-600">
                      {customer.credit_limit > 0 ? (
                        <>
                          <div className="text-money font-semibold">{formatRupiah(customer.credit_limit)}</div>
                          <div className="text-xs text-dark-400 mt-0.5">{customer.payment_terms}</div>
                        </>
                      ) : (
                        <div className="text-xs text-dark-400">Tidak diizinkan</div>
                      )}
                    </td>
                    <td className="text-right">
                      {customer.current_debt > 0 ? (
                        <span className={cn(
                          'font-semibold text-money',
                          customer.current_debt >= customer.credit_limit ? 'text-danger' : 'text-warning-dark'
                        )}>
                          {formatRupiah(customer.current_debt)}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-400">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={cn('badge', customer.is_active ? 'badge-success' : 'badge-danger')}>
                        {customer.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:bg-dark-100 hover:text-dark-900 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="min-w-[160px] bg-white rounded-xl shadow-lg border border-dark-100 p-1 z-50 animate-fade-in" align="end">
                            <DropdownMenu.Item 
                              onClick={() => openEditForm(customer)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Edit Pelanggan
                            </DropdownMenu.Item>
                            
                            {userRole === 'super_admin' && (
                              <>
                                <DropdownMenu.Separator className="h-px bg-dark-100 my-1 mx-2" />
                                <DropdownMenu.Item 
                                  onClick={() => handleDelete(customer.id, customer.name)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg cursor-pointer outline-none transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" /> Hapus
                                </DropdownMenu.Item>
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-dark-100 bg-dark-50 flex items-center justify-between text-xs text-dark-500 flex-shrink-0">
          <div>Menampilkan <span className="font-semibold text-dark-900">{filteredCustomers.length}</span> dari <span className="font-semibold text-dark-900">{customers.length}</span> pelanggan</div>
          <div>Total Piutang Beredar: <span className="font-semibold text-dark-900 text-money">{formatRupiah(customers.reduce((acc, c) => acc + c.current_debt, 0))}</span></div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <CustomerForm 
            initialData={editingCustomer} 
            onSuccess={() => {
              setIsFormOpen(false)
              refreshData()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
