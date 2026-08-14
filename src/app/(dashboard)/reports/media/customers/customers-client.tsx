'use client'

import { Printer, Download, ChevronLeft, Users } from 'lucide-react'
import Link from 'next/link'

interface CustomersMediaClientProps {
  customers: any[]
}

export default function CustomersMediaClient({ customers }: CustomersMediaClientProps) {
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const exportToCSV = () => {
    const rows = [
      ['No', 'Nama Pelanggan', 'Kategori', 'Kontak', 'Alamat', 'Status']
    ]

    customers.forEach((c, index) => {
      rows.push([
        (index + 1).toString(),
        `"${c.name}"`,
        c.category,
        `"${c.phone || '-'}"`,
        `"${c.address || '-'}"`,
        c.is_active ? 'Aktif' : 'Non-aktif'
      ])
    })

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Daftar_Customer_${new Date().toISOString().split('T')[0]}.csv`)
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
              <Users className="w-6 h-6 text-primary-600" />
              Daftar Customer
            </h1>
            <p className="text-sm text-dark-500 mt-1 font-medium">Laporan seluruh daftar pelanggan yang terdaftar.</p>
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
              <h1 className="text-2xl font-black text-dark-900 uppercase tracking-wider mb-2">DAFTAR CUSTOMER</h1>
              <h2 className="text-lg font-bold text-dark-700">SBR FROZEN POS</h2>
              <p className="text-dark-500 mt-2 text-sm font-medium">Dicetak pada: {today} | Total: {customers.length} Pelanggan</p>
            </div>

            {/* Table */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-dark-300 bg-dark-50/50 print:bg-transparent">
                    <th className="py-3 px-4 font-bold text-dark-900 w-12 text-center">No</th>
                    <th className="py-3 px-4 font-bold text-dark-900">Nama Pelanggan</th>
                    <th className="py-3 px-4 font-bold text-dark-900 text-center">Kategori</th>
                    <th className="py-3 px-4 font-bold text-dark-900">Kontak</th>
                    <th className="py-3 px-4 font-bold text-dark-900">Alamat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-dark-500 italic">Belum ada data pelanggan.</td>
                    </tr>
                  ) : (
                    customers.map((c, index) => (
                      <tr key={index} className="hover:bg-dark-50/50 print:hover:bg-transparent transition-colors">
                        <td className="py-3 px-4 text-center text-dark-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">{c.name}</div>
                          {!c.is_active && (
                            <span className="text-xs text-danger font-medium">Non-aktif</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center capitalize text-dark-700">
                          {c.category}
                        </td>
                        <td className="py-3 px-4 text-dark-700 font-mono text-xs">
                          {c.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-dark-600 text-xs">
                          {c.address || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
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
