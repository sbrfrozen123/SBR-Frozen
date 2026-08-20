'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, Play, Square, Banknote, Printer, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { CashierShift } from '@/types/database'

interface ShiftManagementProps {
  userId: string
  branchId: string | null
  activeShift: CashierShift | null
  onShiftChange: (shift: CashierShift | null) => void
}

export function ShiftManagement({ userId, branchId, activeShift, onShiftChange }: ShiftManagementProps) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startingCash, setStartingCash] = useState<number | ''>('')
  
  // For closing
  const [endingCashActual, setEndingCashActual] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [systemCash, setSystemCash] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [closedShiftId, setClosedShiftId] = useState<string | null>(null)
  
  const supabase = createClient()

  // Open Shift automatically prompts if no active shift
  useEffect(() => {
    if (!activeShift && !loading && !closedShiftId) {
      setIsModalOpen(true)
    }
  }, [activeShift, loading, closedShiftId])

  // Calculate System Cash when Closing Modal Opens
  useEffect(() => {
    async function calculateSystemCash() {
      if (activeShift && isModalOpen) {
        setIsCalculating(true)
        try {
          const { data: txns } = await supabase
            .from('transactions')
            .select('amount_paid')
            .eq('user_id', userId)
            .eq('payment_method', 'tunai')
            .gte('created_at', activeShift.start_time)

          const cashSales = (txns || []).reduce((sum, t) => sum + (t.amount_paid || 0), 0)
          setSystemCash(activeShift.starting_cash + cashSales)
        } catch (error) {
          console.error("Error calculating system cash:", error)
        } finally {
          setIsCalculating(false)
        }
      }
    }
    calculateSystemCash()
  }, [isModalOpen, activeShift, supabase, userId])

  const handleOpenShift = async () => {
    if (startingCash === '') return toast.error('Masukkan modal awal')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cashier_shifts')
        .insert([{
          user_id: userId,
          branch_id: branchId,
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
      if (systemCash === null) throw new Error('Menghitung saldo sistem, mohon tunggu')

      const { data, error } = await supabase
        .from('cashier_shifts')
        .update({
          status: 'closed',
          end_time: new Date().toISOString(),
          ending_cash_system: systemCash,
          ending_cash_actual: Number(endingCashActual),
            notes: notes.trim() || null,
        })
        .eq('id', activeShift.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Shift berhasil ditutup')
      setClosedShiftId(activeShift.id)
      onShiftChange(null)
      // Do not close modal yet, show print button
    } catch (error: any) {
      toast.error(error.message || 'Gagal menutup shift')
    } finally {
      setLoading(false)
    }
  }

  if (activeShift) {
    return (
      <div className="flex items-center justify-between w-full bg-success/5 border border-success/20 rounded-xl px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-success/70 uppercase tracking-widest leading-none mb-1">Status Kasir</div>
            <div className="text-sm font-semibold text-success-dark leading-none">Shift Aktif</div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-danger/20 hover:border-danger/40 hover:bg-danger/5 text-danger rounded-lg transition-all text-sm font-medium shadow-sm group"
        >
          <Square className="w-3.5 h-3.5 fill-danger/20 group-hover:fill-danger/40" />
          <span>Tutup Shift</span>
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

              {closedShiftId ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2 text-success">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-dark-900">Shift Berhasil Ditutup!</h3>
                  <p className="text-sm text-dark-500 pb-4">Selisih uang kas telah direkam ke dalam sistem.</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setIsModalOpen(false)
                        setClosedShiftId(null)
                        setEndingCashActual('')
                        setNotes('')
                      }} 
                      className="flex-1 btn-md btn-outline bg-white"
                    >
                      Tutup
                    </button>
                    <a 
                      href={`/print/shift/${closedShiftId}`} 
                      target="_blank" 
                      className="flex-1 btn-md btn-primary bg-dark-900 hover:bg-black text-white border-none text-center"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Rekap
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 text-left">
                    <div className="bg-slate-50 p-4 rounded-xl border border-dark-100 mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs text-dark-500 font-medium uppercase tracking-wider">Target Saldo Sistem</div>
                        <Calculator className="w-4 h-4 text-dark-400" />
                      </div>
                      <div className="text-2xl font-black text-dark-900">
                        {isCalculating ? <Loader2 className="w-5 h-5 animate-spin text-dark-400" /> : systemCash !== null ? formatRupiah(systemCash) : '-'}
                      </div>
                    </div>

                    <div>
                      <label className="label text-sm font-semibold text-dark-700 mb-1">Total Uang Fisik di Laci</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold text-lg">Rp</span>
                        <input 
                          type="number" 
                          value={endingCashActual}
                          onChange={(e) => setEndingCashActual(e.target.value ? Number(e.target.value) : '')}
                          className="input pl-12 h-14 text-xl font-black text-dark-900 border-2 focus:ring-primary/20 transition-all shadow-sm" 
                          placeholder="0"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Real-time Variance Calculation */}
                    {systemCash !== null && endingCashActual !== '' && (
                      <div className={cn(
                        "p-4 rounded-xl flex items-start gap-3 mt-4 border transition-all",
                        Number(endingCashActual) === systemCash ? "bg-success/10 border-success/20 text-success-700" :
                        Number(endingCashActual) > systemCash ? "bg-primary-50 border-primary/20 text-primary-700" :
                        "bg-danger-light/30 border-danger/20 text-danger-700"
                      )}>
                        {Number(endingCashActual) >= systemCash ? (
                          <CheckCircle2 className={cn(
                            "w-5 h-5 mt-0.5",
                            Number(endingCashActual) === systemCash ? "text-success" : "text-primary"
                          )} />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider mb-1">Selisih Kasir</p>
                          <p className="font-black text-lg">
                            {Number(endingCashActual) - systemCash > 0 && "+"}
                            {formatRupiah(Number(endingCashActual) - systemCash)}
                          </p>
                          <p className="text-xs font-medium mt-1 opacity-80">
                            {Number(endingCashActual) === systemCash ? "Kas seimbang, mantap!" :
                             Number(endingCashActual) > systemCash ? "Ada kelebihan kas di laci." :
                             "Kas kurang dari target sistem."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  
                      {/* Notes Input */}
                      <div className="form-group mt-4">
                        <label className="label">Keterangan / Catatan (Opsional)</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="input resize-none h-20"
                          placeholder="Tulis catatan penutupan shift..."
                        />
                      </div>

                    <div className="flex gap-3 pt-2 border-t border-dark-100">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-lg btn-outline bg-white h-14 text-base font-bold">Batal</button>
                    <button onClick={handleCloseShift} disabled={loading || isCalculating || endingCashActual === ''} className="flex-[1.5] btn-lg btn-primary bg-dark-900 hover:bg-black text-white border-none h-14 text-base font-bold shadow-glow-dark">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Akhiri Shift'}
                    </button>
                  </div>
                </>
              )}
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
