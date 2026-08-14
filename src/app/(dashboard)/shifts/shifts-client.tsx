'use client'

import { useState } from 'react'
import { Clock, Search, Printer } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/database'

interface ShiftData {
  id: string
  start_time: string
  end_time: string | null
  starting_cash: number
  ending_cash_system: number | null
  ending_cash_actual: number | null
  status: string
  user?: { full_name: string }
}

interface ShiftsClientProps {
  initialShifts: ShiftData[]
  userRole: UserRole
}

export default function ShiftsClient({ initialShifts, userRole }: ShiftsClientProps) {
  const [search, setSearch] = useState('')

  const filteredShifts = initialShifts.filter(s => {
    const searchLower = search.toLowerCase()
    return s.user?.full_name.toLowerCase().includes(searchLower)
  })

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Riwayat Shift Kasir</h1>
          <p className="page-subtitle">Pantau pembukaan dan penutupan shift serta rekonsiliasi kas.</p>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {userRole === 'super_admin' && (
          <div className="p-4 border-b border-dark-100 flex gap-4 justify-between bg-white flex-shrink-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input 
                type="text" 
                placeholder="Cari nama kasir..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-dark-50 shadow-sm z-10">
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Waktu Shift</th>
                {userRole === 'super_admin' && <th>Kasir</th>}
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Kas Akhir (Sistem)</th>
                <th className="text-right">Kas Akhir (Fisik)</th>
                <th className="text-center">Selisih</th>
                <th className="text-center">Status</th>
                <th className="w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'super_admin' ? 9 : 8} className="text-center py-12 text-dark-400">
                    <Clock className="w-12 h-12 mx-auto text-dark-200 mb-3" />
                    <p className="text-base font-medium text-dark-600">Tidak ada riwayat shift</p>
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift, index) => {
                  const selisih = (shift.ending_cash_actual || 0) - (shift.ending_cash_system || 0)
                  return (
                    <tr key={shift.id}>
                      <td className="text-center text-dark-400 text-sm">{index + 1}</td>
                      <td>
                        <div className="font-semibold text-dark-900">
                          {new Date(shift.start_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div className="text-xs text-dark-500 mt-0.5">
                          sd {shift.end_time ? new Date(shift.end_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Sekarang'}
                        </div>
                      </td>
                      {userRole === 'super_admin' && (
                        <td className="font-medium text-dark-900">{shift.user?.full_name}</td>
                      )}
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_system || 0) : '-'}
                      </td>
                      <td className="text-right text-dark-900 font-semibold">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_actual || 0) : '-'}
                      </td>
                      <td className="text-center">
                        {shift.status === 'closed' ? (
                          <span className={cn(
                            'font-bold',
                            selisih > 0 ? 'text-success' : selisih < 0 ? 'text-danger' : 'text-dark-400'
                          )}>
                            {selisih === 0 ? 'Seimbang' : selisih > 0 ? `+${formatRupiah(selisih)}` : formatRupiah(selisih)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-center">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold tracking-wider',
                          shift.status === 'open' 
                            ? 'bg-primary-500 text-white shadow-glow-primary animate-pulse' 
                            : 'bg-dark-100 text-dark-500'
                        )}>
                          {shift.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-center">
                        {shift.status === 'closed' ? (
                          <a 
                            href={`/print/shift/${shift.id}`} 
                            target="_blank"
                            className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors mx-auto"
                            title="Cetak Rekap Shift"
                          >
                            <Printer className="w-4 h-4" />
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
