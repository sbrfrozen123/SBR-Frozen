'use client'

import { useEffect } from 'react'
import { formatRupiah } from '@/lib/utils/currency'

interface ShiftData {
  id: string
  start_time: string
  end_time: string | null
  starting_cash: number
  ending_cash_system: number | null
  ending_cash_actual: number | null
  status: string
  profiles?: { 
    full_name: string
    branches?: {
      name: string
      address?: string
      phone?: string
    }
  }
}

interface PrintClientProps {
  shift: ShiftData
  settings: any
  cashSales: number
  nonCashSales: number
}

export default function PrintClient({ shift, settings, cashSales, nonCashSales }: PrintClientProps) {
  const branchInfo = shift.profiles?.branches
  const printStoreName = branchInfo?.name ? `${settings?.store_name || 'SBR Frozen'} - ${branchInfo.name}` : (settings?.store_name || 'SBR Frozen')
  const printAddress = branchInfo?.address || settings?.store_address
  const printPhone = branchInfo?.phone || settings?.store_phone || '-'
  useEffect(() => {
    // Automatically open print dialog when component mounts
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const selisih = (shift.ending_cash_actual || 0) - (shift.ending_cash_system || 0)

  return (
    <div className="bg-white text-black min-h-screen">
      {/* 80mm thermal receipt container */}
      <div className="w-[80mm] mx-auto p-4 text-[12px] font-mono leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>
        
        {/* Header */}
        <div className="text-center mb-6 border-b border-dashed border-black pb-4">
          <h1 className="font-bold text-lg mb-1">{printStoreName}</h1>
          {printAddress && <p className="whitespace-pre-wrap">{printAddress}</p>}
          <p>Telp: {printPhone}</p>
        </div>

        {/* Shift Info */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-sm">REKAPITULASI SHIFT</h2>
        </div>

        <div className="mb-6 space-y-1">
          <div className="flex justify-between">
            <span>Kasir</span>
            <span className="font-bold">{shift.profiles?.full_name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Buka Shift</span>
            <span>{new Date(shift.start_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
          <div className="flex justify-between">
            <span>Tutup Shift</span>
            <span>{shift.end_time ? new Date(shift.end_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="uppercase font-bold">{shift.status}</span>
          </div>
        </div>

        {/* Financial Info */}
        <div className="border-t border-b border-dashed border-black py-4 mb-6 space-y-2">
          
          <div className="flex justify-between">
            <span>Modal Awal (Tunai)</span>
            <span>{formatRupiah(shift.starting_cash)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Penjualan Tunai</span>
            <span>{formatRupiah(cashSales)}</span>
          </div>

          <div className="flex justify-between text-dark-500">
            <span>Penjualan Non-Tunai</span>
            <span>{formatRupiah(nonCashSales)}</span>
          </div>
          
          <div className="pt-2 mt-2 border-t border-dotted border-black flex justify-between font-bold">
            <span>Total Tunai Seharusnya</span>
            <span>{formatRupiah(shift.starting_cash + cashSales)}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total Fisik di Laci</span>
            <span>{formatRupiah(shift.ending_cash_actual || 0)}</span>
          </div>

        </div>

        {/* Selisih */}
        <div className="mb-8 flex justify-between text-sm font-bold p-2 bg-dark-50 rounded">
          <span>SELISIH:</span>
          <span>
            {selisih === 0 ? 'SEIMBANG (Rp 0)' : selisih > 0 ? `LEBIH +${formatRupiah(selisih)}` : `KURANG ${formatRupiah(selisih)}`}
          </span>
        </div>

        {/* Footer / Signatures */}
        <div className="grid grid-cols-2 gap-4 text-center mt-12 mb-8">
          <div>
            <div className="mb-12">Diserahkan Oleh,</div>
            <div className="border-b border-black w-24 mx-auto mb-1"></div>
            <div>{shift.profiles?.full_name || 'Kasir'}</div>
          </div>
          <div>
            <div className="mb-12">Diterima Oleh,</div>
            <div className="border-b border-black w-24 mx-auto mb-1"></div>
            <div>SPV / Admin</div>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-gray-500 mt-4 border-t border-dashed border-black pt-4">
          <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white;
          }
          @page {
            margin: 0;
            size: 80mm auto;
          }
        }
      `}</style>
    </div>
  )
}
