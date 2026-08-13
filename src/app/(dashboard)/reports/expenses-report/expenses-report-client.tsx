'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Receipt, Wallet, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface ExpensesReportClientProps {
  expenses: any[]
}

export default function ExpensesReportClient({ expenses }: ExpensesReportClientProps) {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month')

  const { filteredExpenses, totalAmount, categoryTotals } = useMemo(() => {
    const today = new Date()
    const thisMonthStr = today.toISOString().slice(0, 7)
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7)

    let filterDate = ''
    if (period === 'this_month') filterDate = thisMonthStr
    if (period === 'last_month') filterDate = lastMonthStr

    const filtered = filterDate 
      ? expenses.filter(e => e.expense_date.startsWith(filterDate))
      : expenses

    const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)

    const categories: Record<string, number> = {}
    filtered.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount)
    })

    return { 
      filteredExpenses: filtered,
      totalAmount: total, 
      categoryTotals: Object.entries(categories).sort((a, b) => b[1] - a[1])
    }
  }, [expenses, period])

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-danger-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-danger-500" />
              Laporan Pengeluaran
            </h1>
            <p className="text-sm text-dark-500 mt-1">Rekapitulasi biaya operasional dan pengeluaran lainnya.</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm">
          {(['this_month', 'last_month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                period === p ? 'bg-danger-50 text-danger-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
              )}
            >
              {p === 'this_month' ? 'Bulan Ini' : p === 'last_month' ? 'Bulan Lalu' : 'Semua Waktu'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Summary & Categories */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm flex flex-col justify-center text-center">
            <div className="w-12 h-12 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-dark-500 uppercase tracking-wide mb-1">Total Pengeluaran</p>
            <p className="text-3xl font-bold text-danger text-money">{formatRupiah(totalAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-dark-100 bg-slate-50">
              <h3 className="font-bold text-dark-900">Per Kategori</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {categoryTotals.length === 0 ? (
                <div className="text-center text-dark-400 text-sm mt-4">Tidak ada data.</div>
              ) : (
                categoryTotals.map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-dark-50 rounded-xl">
                    <span className="font-medium text-dark-700 capitalize">{category}</span>
                    <span className="font-bold text-dark-900">{formatRupiah(amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dark-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-dark-100 bg-slate-50">
            <h3 className="font-bold text-dark-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dark-400" />
              Rincian Pengeluaran
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="data-table w-full">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Kategori</th>
                  <th className="text-right">Nominal</th>
                  <th>Oleh</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-dark-400">Belum ada pengeluaran di periode ini.</td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id}>
                      <td className="text-dark-600">{formatDateShort(expense.expense_date)}</td>
                      <td className="font-medium text-dark-900 max-w-[200px] truncate" title={expense.description}>{expense.description}</td>
                      <td>
                        <span className="badge badge-primary bg-dark-50 text-dark-700 border-dark-200 capitalize">
                          {expense.category}
                        </span>
                      </td>
                      <td className="text-right font-bold text-danger">
                        {formatRupiah(expense.amount)}
                      </td>
                      <td className="text-dark-500 text-sm">{expense.profiles?.full_name || 'Sistem'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
