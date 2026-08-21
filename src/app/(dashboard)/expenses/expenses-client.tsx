'use client'

import { useState, useMemo } from 'react'
import { 
  Plus, Search, Filter, MoreVertical, Edit, Trash2, 
  Receipt, Wallet, TrendingDown, Calendar, Paperclip, ExternalLink
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type { Expense } from '@/types/database'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ExpensesClientProps {
  initialExpenses: (Expense & { profiles: { full_name: string } | null })[]
  userId: string
  branchId: string | null
}

const CATEGORIES = ['Semua', 'operasional', 'logistik', 'sdm', 'lain-lain']

export default function ExpensesClient({ initialExpenses, userId, branchId }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua')
  
  // Month filter (default to current month: YYYY-MM)
  const today = new Date()
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [monthFilter, setMonthFilter] = useState(currentMonthStr)
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)

  const supabase = createClient()

  // Filter expenses (client-side for search/category, server-side for month change)
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const searchLower = search.toLowerCase()
      const matchesSearch = e.description?.toLowerCase().includes(searchLower) || false
      const matchesCategory = categoryFilter === 'Semua' || e.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [expenses, search, categoryFilter])

  // Summaries
  const totalPengeluaran = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const operasional = filteredExpenses.filter(e => e.category === 'operasional').reduce((sum, e) => sum + e.amount, 0)
  const sdm = filteredExpenses.filter(e => e.category === 'sdm').reduce((sum, e) => sum + e.amount, 0)

  // Fetch new data when month changes
  const fetchExpenses = async (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('expenses')
      .select('*, profiles(full_name)')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false })

    if (error) {
      toast.error('Gagal mengambil data bulan tersebut')
    } else {
      setExpenses(data || [])
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMonthFilter(val)
    if (val) fetchExpenses(val)
  }

  const refreshData = () => {
    fetchExpenses(monthFilter)
  }

  const handleDelete = async (id: string, desc: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus catatan pengeluaran "${desc}"?`)) return
    
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
      toast.success('Pengeluaran berhasil dihapus')
      refreshData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data')
    }
  }

  const openAddForm = () => {
    setEditingExpense(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const viewReceipt = async (filePath: string) => {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(filePath, 3600) // 1 hour expiry
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      toast.error('Gagal membuka file bukti')
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Manajemen Pengeluaran</h1>
          <p className="page-subtitle">Catat dan pantau seluruh biaya operasional bisnis Anda.</p>
        </div>
        <button onClick={openAddForm} className="btn-md btn-primary">
          <Plus className="w-4 h-4" />
          Catat Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div className="summary-card summary-card-danger group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-dark-900 text-money mb-1">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-danger" />
            </div>
          </div>
        </div>
        
        <div className="summary-card summary-card-warning group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Biaya Operasional</p>
              <p className="text-2xl font-bold text-dark-900 text-money mb-1">{formatRupiah(operasional)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center">
              <Receipt className="w-6 h-6 text-warning-dark" />
            </div>
          </div>
        </div>

        <div className="summary-card summary-card-accent group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Biaya SDM & Gaji</p>
              <p className="text-2xl font-bold text-dark-900 text-money mb-1">{formatRupiah(sdm)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 justify-between bg-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input 
                type="text" 
                placeholder="Cari deskripsi..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            
            <div className="relative w-full sm:max-w-[200px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input 
                type="month" 
                value={monthFilter}
                onChange={handleMonthChange}
                className="input pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize',
                  categoryFilter === cat 
                    ? 'bg-dark-900 text-white' 
                    : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
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
                <th className="w-12 text-center">No</th>                  <th className="w-28">ID Pengeluaran</th>

                <th className="text-left w-28">ID Pengeluaran</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Pencatat</th>
                <th className="text-right">Nominal</th>
                <th className="text-center">Bukti</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">
                    <Receipt className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada pengeluaran</p>
                    <p className="text-sm">Bulan ini keuangan Anda masih bersih.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td className="text-center text-dark-400 text-sm">{index + 1}</td>                      <td className="font-mono text-xs text-dark-500">{expense.expense_code || '-'}</td>

                    <td className="text-dark-600 font-medium">
                      {formatDateShort(expense.expense_date)}
                    </td>
                    <td>
                      <div className="font-semibold text-dark-900 line-clamp-2" title={expense.description || ''}>
                        {expense.description}
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        'badge capitalize',
                        expense.category === 'operasional' ? 'badge-primary' :
                        expense.category === 'logistik' ? 'badge-warning' : 
                        expense.category === 'sdm' ? 'badge-accent' : 'badge-gray'
                      )}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="text-sm text-dark-600">
                      {expense.profiles?.full_name || 'System'}
                    </td>
                    <td className="text-right font-semibold text-danger-dark text-money">
                      {formatRupiah(expense.amount)}
                    </td>
                    <td className="text-center">
                      {expense.receipt_url ? (
                        <button 
                          onClick={() => viewReceipt(expense.receipt_url!)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                          title="Lihat Bukti Lampiran"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-dark-300">-</span>
                      )}
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
                            {expense.receipt_url && (
                              <DropdownMenu.Item 
                                onClick={() => viewReceipt(expense.receipt_url!)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" /> Buka Bukti
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item 
                              onClick={() => openEditForm(expense)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-50 hover:text-primary-600 rounded-lg cursor-pointer outline-none transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Edit Catatan
                            </DropdownMenu.Item>
                            
                            <DropdownMenu.Separator className="h-px bg-dark-100 my-1 mx-2" />
                            <DropdownMenu.Item 
                              onClick={() => handleDelete(expense.id, expense.description || 'Ini')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg cursor-pointer outline-none transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Hapus
                            </DropdownMenu.Item>
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
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay z-[100]">
          <ExpenseForm 
            initialData={editingExpense} 
            userId={userId}
            branchId={branchId}
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

