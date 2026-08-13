'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, Play, Square, Banknote } from 'lucide-react'
import type { CashierShift } from '@/types/database'

interface ShiftManagementProps {
  userId: string
  activeShift: CashierShift | null
  onShiftChange: (shift: CashierShift | null) => void
}

export function ShiftManagement({ userId, activeShift, onShiftChange }: ShiftManagementProps) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startingCash, setStartingCash] = useState<number | ''>('')
  
  // For closing
  const [endingCashActual, setEndingCashActual] = useState<number | ''>('')
  
  const supabase = createClient()

  // Open Shift automatically prompts if no active shift
  useEffect(() => {
    if (!activeShift && !loading) {
      setIsModalOpen(true)
    }
  }, [activeShift, loading])

  const handleOpenShift = async () => {
    if (startingCash === '') return toast.error('Masukkan modal awal')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cashier_shifts')
        .insert([{
          user_id: userId,
          starting_cash: Number(startingCash),
          status: 'open'
        }])
        .select()
        .single()
        
      if (error) throw error
      toast.success('Shift berhasil dibuka')
      onShiftChange(data)
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuka shift')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseShift = async () => {
    if (endingCashActual === '') return toast.error('Masukkan uang fisik di laci')
    if (!activeShift) return
    
    setLoading(true)
    try {
      // Calculate system cash (Starting Cash + Cash Sales in this shift)
      // For simplicity in Phase 1, we just fetch sum of cash sales since start_time for this user
      const { data: txns } = await supabase
        .from('transactions')
        .select('amount_paid')
        .eq('user_id', userId)
        .eq('payment_method', 'tunai')
        .gte('created_at', activeShift.start_time)

      const cashSales = (txns || []).reduce((sum, t) => sum + (t.amount_paid || 0), 0)
      const systemCash = activeShift.starting_cash + cashSales

      const { data, error } = await supabase
        .from('cashier_shifts')
        .update({
          status: 'closed',
          end_time: new Date().toISOString(),
          ending_cash_system: systemCash,
          ending_cash_actual: Number(endingCashActual),
        })
        .eq('id', activeShift.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Shift berhasil ditutup')
      onShiftChange(null)
      setIsModalOpen(false)
      setEndingCashActual('')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menutup shift')
    } finally {
      setLoading(false)
    }
  }

  if (activeShift) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-dark-400 font-medium uppercase">Status Shift</div>
          <div className="text-sm font-bold text-success flex items-center justify-end gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Terbuka
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-md bg-dark-800 text-white hover:bg-dark-900 border-none flex-shrink-0"
        >
          <Square className="w-4 h-4 fill-danger text-danger" />
          <span className="hidden sm:inline">Tutup Shift</span>
        </button>

        {isModalOpen && (
          <div className="modal-overlay z-[200]">
            <div className="modal-content max-w-sm">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-8 h-8 text-dark-600" />
                </div>
                <h2 className="text-xl font-bold text-dark-900">Tutup Shift Kasir</h2>
                <p className="text-sm text-dark-500 mt-1">Hitung dan masukkan total uang tunai yang ada di laci kasir saat ini.</p>
              </div>

              <div className="space-y-4 mb-6 text-left">
                <div>
                  <label className="label">Total Uang Fisik di Laci</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-lg">Rp</span>
                    <input 
                      type="number" 
                      value={endingCashActual}
                      onChange={(e) => setEndingCashActual(e.target.value ? Number(e.target.value) : '')}
                      className="input pl-12 h-14 text-xl font-bold text-dark-900" 
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-md btn-outline bg-white">Batal</button>
                <button onClick={handleCloseShift} disabled={loading} className="flex-1 btn-md btn-primary bg-dark-900 hover:bg-black text-white border-none">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Akhiri Shift'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // No active shift -> Modal forces to open
  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="btn-md btn-primary">
        Buka Shift
      </button>

      {isModalOpen && (
        <div className="modal-overlay z-[200] backdrop-blur-md bg-dark-900/80">
          <div className="modal-content max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary-600 ml-1" />
              </div>
              <h2 className="text-xl font-bold text-dark-900">Buka Shift Kasir</h2>
              <p className="text-sm text-dark-500 mt-1">Masukkan nominal modal awal (uang pecahan) yang ada di laci kasir sebelum memulai penjualan.</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Modal Awal / Saldo Laci</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-lg">Rp</span>
                  <input 
                    type="number" 
                    value={startingCash}
                    onChange={(e) => setStartingCash(e.target.value ? Number(e.target.value) : '')}
                    className="input pl-12 h-14 text-xl font-bold text-dark-900" 
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <button onClick={handleOpenShift} disabled={loading} className="w-full btn-lg btn-primary h-14 text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Mulai Shift'}
            </button>
            <div className="mt-4 text-center">
              <a href="/" className="text-sm text-dark-400 hover:text-dark-600 underline">Kembali ke Dashboard</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
