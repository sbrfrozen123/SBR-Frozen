'use client'

import { useState, useMemo } from 'react'
import { 
  Search, Filter, BookOpen, AlertCircle, Calendar, CreditCard, ChevronRight
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { PaymentForm } from '@/components/receivables/PaymentForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface ReceivablesClientProps {
  initialTransactions: any[]
  userId: string
}

export default function ReceivablesClient({ initialTransactions, userId }: ReceivablesClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'semua' | 'jatuh_tempo' | 'aman'>('semua')
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTxn, setSelectedTxn] = useState<any | undefined>(undefined)

  const supabase = createClient()

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const today = new Date().toISOString()
    
    return transactions.filter(t => {
      const customerName = t.customers?.name?.toLowerCase() || ''
      const invoice = t.invoice_number?.toLowerCase() || ''
      const searchLower = search.toLowerCase()
      
      const matchesSearch = customerName.includes(searchLower) || invoice.includes(searchLower)
      
      let matchesStatus = true
      if (statusFilter === 'jatuh_tempo') {
        matchesStatus = t.due_date && t.due_date < today
      } else if (statusFilter === 'aman') {
        matchesStatus = !t.due_date || t.due_date >= today
      }

      return matchesSearch && matchesStatus
    })
  }, [transactions, search, statusFilter])

  // Summaries
  const totalPiutang = transactions.reduce((sum, t) => sum + (t.total_amount - t.amount_paid), 0)
  
  const todayDate = new Date().toISOString()
  const totalJatuhTempo = transactions
    .filter(t => t.due_date && t.due_date < todayDate)
    .reduce((sum, t) => sum + (t.total_amount - t.amount_paid), 0)

  const refreshData = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          current_debt,
          credit_limit
        )
      `)
      .eq('payment_status', 'piutang')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Gagal memuat data terbaru')
    } else {
      setTransactions(data || [])
    }
  }

  const openPaymentForm = (txn: any) => {
    setSelectedTxn(txn)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Buku Piutang Pelanggan</h1>
          <p className="page-subtitle">Pantau tagihan yang belum lunas dan catat pembayaran cicilan.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <div className="summary-card summary-card-warning group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Total Piutang Berjalan</p>
              <p className="text-3xl font-bold text-dark-900 text-money mb-1">{formatRupiah(totalPiutang)}</p>
              <p className="text-sm text-dark-500">Dari {transactions.length} invoice belum lunas</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-warning-light flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-warning-dark" />
            </div>
          </div>
        </div>
        
        <div className="summary-card summary-card-danger group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Lewat Jatuh Tempo</p>
              <p className="text-3xl font-bold text-danger-dark text-money mb-1">{formatRupiah(totalJatuhTempo)}</p>
              <p className="text-sm text-danger/80">Perlu penagihan segera</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-danger-light flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-danger" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-100 flex flex-col sm:flex-row gap-4 justify-between bg-white flex-shrink-0">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Cari pelanggan atau no invoice..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-dark-400 mr-1 flex-shrink-0" />
            {[
              { id: 'semua', label: 'Semua Status' },
              { id: 'jatuh_tempo', label: 'Jatuh Tempo' },
              { id: 'aman', label: 'Belum Jatuh Tempo' },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  statusFilter === filter.id 
                    ? filter.id === 'jatuh_tempo' ? 'bg-danger text-white' : 'bg-dark-900 text-white' 
                    : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th>Invoice & Tanggal</th>
                <th>Pelanggan</th>
                <th className="text-right">Total Tagihan</th>
                <th className="text-right">Sudah Dibayar</th>
                <th className="text-right">Sisa Piutang</th>
                <th className="text-center">Jatuh Tempo</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-400">
                    <BookOpen className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada piutang ditemukan</p>
                    <p className="text-sm">Semua tagihan lunas atau tidak ada data yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const remaining = txn.total_amount - txn.amount_paid
                  const isOverdue = txn.due_date && txn.due_date < todayDate

                  return (
                    <tr key={txn.id} className={isOverdue ? 'bg-danger-light/10' : ''}>
                      <td>
                        <div className="font-semibold text-dark-900 font-mono text-sm">{txn.invoice_number}</div>
                        <div className="text-xs text-dark-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDateShort(txn.created_at)}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-dark-900">{txn.customers?.name || 'Unknown'}</div>
                        <div className="text-xs text-dark-400 mt-0.5">{txn.customers?.phone || '-'}</div>
                      </td>
                      <td className="text-right font-medium text-dark-600">
                        {formatRupiah(txn.total_amount)}
                      </td>
                      <td className="text-right font-medium text-success-dark">
                        {formatRupiah(txn.amount_paid)}
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-money text-danger-dark">
                          {formatRupiah(remaining)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={cn(
                          'badge',
                          isOverdue ? 'badge-danger border border-danger/20' : 'badge-warning'
                        )}>
                          {txn.due_date ? formatDateShort(txn.due_date) : '-'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => openPaymentForm(txn)}
                          className="btn-sm w-full bg-dark-900 text-white hover:bg-dark-800"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          Bayar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && selectedTxn && (
        <div className="modal-overlay z-[100]">
          <PaymentForm 
            transaction={selectedTxn}
            userId={userId}
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
