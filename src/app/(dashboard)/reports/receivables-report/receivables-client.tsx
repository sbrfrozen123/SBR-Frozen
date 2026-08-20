'use client'

import { formatRupiah } from '@/lib/utils/currency'
import { Printer, Download, ChevronLeft, Receipt } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ReceivablesClientProps {
  customers: any[]
}

export default function ReceivablesClient({ customers }: ReceivablesClientProps) {
  const router = useRouter()
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalReceivables = customers.reduce((acc, c) => acc + c.current_debt, 0)
  const grandTotalTransaction = customers.reduce((acc, c) => acc + (c.total_transaction || 0), 0)
  const grandTotalPaid = customers.reduce((acc, c) => acc + (c.total_paid || 0), 0)

  const exportToCSV = () => {
    const rows = [
      ['No', 'Nama Pelanggan', 'Kontak', 'Batas Piutang', 'Termin', 'Total Transaksi', 'Jumlah Dibayar', 'Piutang Berjalan']
    ]

    customers.forEach((c, index) => {
      rows.push([
        (index + 1).toString(),
        `"${c.name}"`,
        `"${c.phone || '-'}"`,
        c.credit_limit.toString(),
        c.payment_terms || 'COD',
        (c.total_transaction || 0).toString(),
        (c.total_paid || 0).toString(),
        c.current_debt.toString()
      ])
    })

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Laporan_Piutang_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-5xl mx-auto w-full bg-slate-50 min-h-screen">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-dark-100 flex-shrink-0 print:hidden relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary-50/50 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/reports" className="btn btn-outline btn-md p-2 text-dark-600 hover:text-dark-900 border-dark-200">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary-600" />
              Laporan Piutang Pelanggan
            </h1>
            <p className="text-sm text-dark-500 mt-1 font-medium">Rekapitulasi piutang berjalan yang belum dilunasi.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <button onClick={exportToCSV} className="btn btn-outline btn-md text-dark-600 border-dark-200 hover:bg-dark-50 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-md shadow-sm shadow-primary-500/20 flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          @page { size: portrait; margin: 15mm; }
        }
      `}} />

      {/* Document Paper */}
      <div className="flex-1 overflow-auto print:overflow-visible">
        <div className="bg-white border border-dark-100 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-8 sm:p-12 print:p-0">
            {/* Header Laporan */}
            <div className="text-center mb-8 border-b-2 border-dark-900 pb-6">
              <h1 className="text-2xl font-black text-dark-900 uppercase tracking-wider mb-2">LAPORAN PIUTANG PELANGGAN</h1>
              <h2 className="text-lg font-bold text-dark-700">SBR FROZEN POS</h2>
              <p className="text-dark-500 mt-2 text-sm font-medium">Dicetak pada: {today}</p>
            </div>

            {/* Table Piutang */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-dark-300">
                    <th className="py-3 px-4 font-bold text-dark-900 w-16 text-center">No</th>
                    <th className="py-3 px-4 font-bold text-dark-900">Nama Pelanggan</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-center">Batas Piutang</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-center">Termin</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-right">Total Transaksi</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-right">Jumlah Dibayar</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-right">Piutang Berjalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-dark-500 italic">Tidak ada piutang pelanggan saat ini.</td>
                    </tr>
                  ) : (
                    customers.map((c, index) => (
                      <tr key={index} className="hover:bg-dark-50/50 print:hover:bg-transparent transition-colors">
                        <td className="py-3 px-4 text-center text-dark-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">{c.name}</div>
                          <div className="text-xs text-dark-400 mt-0.5">{c.phone || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {c.credit_limit > 0 ? (
                            <span className="text-dark-600 font-medium">{formatRupiah(c.credit_limit)}</span>
                          ) : (
                            <span className="text-xs text-dark-400">Tidak ada</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex px-2 py-1 rounded bg-dark-50 text-dark-700 font-medium text-xs">
                            {c.payment_terms || 'COD'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-dark-700">
                          {formatRupiah(c.total_transaction || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          {formatRupiah(c.total_paid || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-dark-900 text-money">{formatRupiah(c.current_debt)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-dark-300 bg-dark-50/50 print:bg-transparent">
                    <td colSpan={4} className="py-4 px-4 text-right font-black text-dark-900 uppercase">
                      Total Piutang Berjalan
                    </td>
                    <td className="py-4 px-4 text-right font-black text-dark-900">
                      {formatRupiah(grandTotalTransaction)}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-emerald-700">
                      {formatRupiah(grandTotalPaid)}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-xl text-dark-900 border-l-2 border-dark-200">
                      {formatRupiah(totalReceivables)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer / Signature */}
            <div className="mt-16 flex justify-end print:mt-24">
              <div className="text-center w-48">
                <p className="text-dark-600 mb-20 text-sm">Mengetahui,</p>
                <div className="border-b border-dark-900 w-full mb-2"></div>
                <p className="font-bold text-dark-900 text-sm">Manager / Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
