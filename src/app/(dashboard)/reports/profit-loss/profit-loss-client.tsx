'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp, DollarSign, Printer } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface ProfitLossClientProps {
  transactions: any[]
  transactionItems: any[]
  expenses: any[]
}

export default function ProfitLossClient({ transactions, transactionItems, expenses }: ProfitLossClientProps) {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month')

  const { totalRevenue, totalCogs, totalExpenses, expenseByCategory, filterDate } = useMemo(() => {
    const today = new Date()
    const thisMonthStr = today.toISOString().slice(0, 7)
    
    // For last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7)

    let filterDate = ''
    if (period === 'this_month') filterDate = thisMonthStr
    if (period === 'last_month') filterDate = lastMonthStr

    // Filter Sales
    const filteredTxns = filterDate 
      ? transactions.filter(t => t.created_at.startsWith(filterDate))
      : transactions

    const filteredItems = filterDate
      ? transactionItems.filter(i => i.created_at.startsWith(filterDate))
      : transactionItems

    // Filter Expenses
    const filteredExp = filterDate
      ? expenses.filter(e => e.expense_date.startsWith(filterDate))
      : expenses

    const totalRevenue = filteredTxns.reduce((sum, t) => sum + Number(t.total_amount), 0)
    const totalCogs = filteredItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.products?.hpp || 0)), 0)
    const totalExpenses = filteredExp.reduce((sum, e) => sum + Number(e.amount), 0)

    // Group expenses by category
    const expenseByCategory: Record<string, number> = {}
    filteredExp.forEach(e => {
      const cat = e.category || 'Lain-lain'
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount)
    })

    return { totalRevenue, totalCogs, totalExpenses, expenseByCategory, filterDate }
  }, [transactions, transactionItems, expenses, period])

  const grossProfit = totalRevenue - totalCogs
  const netProfit = grossProfit - totalExpenses

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-4xl mx-auto w-full print:p-0 print:m-0 print:space-y-0 print:block">
      {/* Header - Hidden on print */}
      <div className="flex items-center justify-between flex-shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-xl bg-white border border-dark-100 flex items-center justify-center text-dark-500 hover:text-emerald-600 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
              Laba Rugi (Profit & Loss)
            </h1>
            <p className="text-sm text-dark-500 mt-1">Laporan keuangan standar akuntansi.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="btn-md btn-outline bg-white hover:bg-dark-50 hover:text-primary-600"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </button>
          
          {/* Period Filter */}
          <div className="flex bg-white rounded-xl border border-dark-100 p-1 shadow-sm">
          {(['this_month', 'last_month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                period === p ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-dark-500 hover:text-dark-900'
              )}
            >
              {p === 'this_month' ? 'Bulan Ini' : p === 'last_month' ? 'Bulan Lalu' : 'Semua Waktu'}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-8 text-center">
        <h2 className="text-2xl font-bold text-dark-900">SBR Frozen</h2>
        <h3 className="text-xl font-bold text-dark-800 mt-1">Laporan Laba Rugi</h3>
        <p className="text-dark-600 mt-1">
          Periode: {period === 'all' ? 'Semua Waktu' : period === 'this_month' ? 'Bulan Ini' : 'Bulan Lalu'} 
          {filterDate && ` (${filterDate})`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-dark-900">
              <th className="pb-3 font-bold text-dark-900 uppercase">Keterangan</th>
              <th className="pb-3 font-bold text-dark-900 uppercase text-right w-48">Nilai (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {/* PENDAPATAN */}
            <tr>
              <td colSpan={2} className="pt-6 pb-2 font-bold text-dark-900 text-base">
                PENDAPATAN
              </td>
            </tr>
            <tr className="border-b border-dark-100 border-dotted">
              <td className="py-3 pl-6 text-dark-700">Pendapatan Penjualan</td>
              <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(totalRevenue).replace('Rp', '')}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-dark-900">TOTAL PENDAPATAN</td>
              <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalRevenue).replace('Rp', '')}</td>
            </tr>

            {/* HARGA POKOK PENJUALAN */}
            <tr>
              <td colSpan={2} className="pt-8 pb-2 font-bold text-dark-900 text-base">
                HARGA POKOK PENJUALAN (HPP)
              </td>
            </tr>
            <tr className="border-b border-dark-100 border-dotted">
              <td className="py-3 pl-6 text-dark-700">HPP Barang Terjual</td>
              <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(totalCogs).replace('Rp', '')}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-dark-900">TOTAL HPP</td>
              <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalCogs).replace('Rp', '')}</td>
            </tr>

            {/* LABA KOTOR */}
            <tr className="bg-primary-50/50 print:bg-transparent">
              <td className="py-4 mt-4 font-bold text-primary-900 text-base print:text-dark-900 print:border-t-2 print:border-b-2 print:border-dark-900">
                LABA KOTOR
              </td>
              <td className="py-4 mt-4 text-right font-bold text-primary-900 text-base print:text-dark-900 print:border-t-2 print:border-b-2 print:border-dark-900">
                {formatRupiah(grossProfit).replace('Rp', '')}
              </td>
            </tr>

            {/* BEBAN OPERASIONAL */}
            <tr>
              <td colSpan={2} className="pt-8 pb-2 font-bold text-dark-900 text-base">
                BEBAN OPERASIONAL
              </td>
            </tr>
            {Object.keys(expenseByCategory).length === 0 ? (
              <tr className="border-b border-dark-100 border-dotted">
                <td className="py-3 pl-6 text-dark-400 italic">Tidak ada pengeluaran</td>
                <td className="py-3 text-right text-dark-400">0</td>
              </tr>
            ) : (
              Object.entries(expenseByCategory).map(([cat, val]) => (
                <tr key={cat} className="border-b border-dark-100 border-dotted">
                  <td className="py-3 pl-6 text-dark-700 capitalize">Beban {cat}</td>
                  <td className="py-3 text-right font-medium text-dark-900">{formatRupiah(val as number).replace('Rp', '')}</td>
                </tr>
              ))
            )}
            <tr>
              <td className="py-3 font-bold text-dark-900">TOTAL BEBAN OPERASIONAL</td>
              <td className="py-3 text-right font-bold text-dark-900">{formatRupiah(totalExpenses).replace('Rp', '')}</td>
            </tr>

            {/* LABA BERSIH */}
            <tr className={cn(
              "print:bg-transparent",
              netProfit >= 0 ? "bg-emerald-50/50" : "bg-danger-50/50"
            )}>
              <td className={cn(
                "py-5 mt-4 font-black text-lg print:text-dark-900 print:border-t-[3px] print:border-b-[3px] print:border-dark-900",
                netProfit >= 0 ? "text-emerald-700" : "text-danger-700"
              )}>
                LABA BERSIH (NET PROFIT)
              </td>
              <td className={cn(
                "py-5 mt-4 text-right font-black text-xl print:text-dark-900 print:border-t-[3px] print:border-b-[3px] print:border-dark-900",
                netProfit >= 0 ? "text-emerald-700" : "text-danger-700"
              )}>
                {formatRupiah(netProfit).replace('Rp', '')}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  )
}
