'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X, CheckCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'

interface SupplierPaymentModalProps {
  purchase: any
  onSuccess: (updatedPurchase: any) => void
  onClose: () => void
}

export default function SupplierPaymentModal({ purchase, onSuccess, onClose }: SupplierPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<'tunai'|'transfer_bank'|'qris'>('tunai')
  const [paymentAccount, setPaymentAccount] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [banks, setBanks] = useState<string[]>([])

  const supabase = createClient()
  const remainingDebt = Math.max(0, purchase.total_amount - (purchase.amount_paid || 0))

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    
    // Fetch banks from branch
    supabase.from('branches').select('bank_name_1, bank_name_2').eq('id', purchase.branch_id).single()
      .then(({ data }) => {
        if (data) {
          const b = []
          if (data.bank_name_1) b.push(data.bank_name_1)
          if (data.bank_name_2) b.push(data.bank_name_2)
          setBanks(b)
          if (b.length > 0) setPaymentAccount(b[0])
        }
      })
  }, [purchase.branch_id, supabase])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      toast.error('Gagal mendapatkan ID User')
      return
    }

    const paymentAmount = Number(amount)
    if (paymentAmount <= 0) {
      toast.error('Nominal pembayaran harus lebih dari 0')
      return
    }
    if (paymentAmount > remainingDebt) {
      toast.error(`Nominal tidak boleh melebihi sisa hutang (${formatRupiah(remainingDebt)})`)
      return
    }

    setLoading(true)
    try {
      // 1. Insert into supplier_payments
      const { error: paymentError } = await supabase
        .from('supplier_payments')
        .insert([{
          purchase_id: purchase.id,
          supplier_id: purchase.supplier_id,
          user_id: userId,
          branch_id: purchase.branch_id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          payment_account: (paymentMethod === 'transfer_bank' || paymentMethod === 'qris') ? paymentAccount : null,
          notes
        }])

      if (paymentError) throw paymentError

      // 2. Update purchase amount_paid and status
      const newAmountPaid = (purchase.amount_paid || 0) + paymentAmount
      const isFullyPaid = newAmountPaid >= purchase.total_amount
      
      const { error: txnError } = await supabase
        .from('purchases')
        .update({
          amount_paid: newAmountPaid,
          payment_status: isFullyPaid ? 'lunas' : 'tempo'
        })
        .eq('id', purchase.id)

      if (txnError) throw txnError

      toast.success('Pembayaran cicilan hutang berhasil dicatat!')
      onSuccess({
        id: purchase.id,
        amount_paid: newAmountPaid,
        payment_status: isFullyPaid ? 'lunas' : 'tempo'
      })
      onClose()

    } catch (error: any) {
      console.error('Error saving payment:', error)
      toast.error(error.message || 'Gagal menyimpan pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-dark-900">Bayar Cicilan Hutang</h2>
            <p className="text-xs text-dark-500 font-mono mt-1">Invoice: {purchase.invoice_number}</p>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 rounded-xl border border-warning-light bg-warning-light/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dark-600">Total Transaksi:</span>
              <span className="font-semibold">{formatRupiah(purchase.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dark-600">Sudah Dibayar (DP):</span>
              <span className="font-semibold text-success-dark">{formatRupiah(purchase.amount_paid || 0)}</span>
            </div>
            <div className="border-t border-warning/20 pt-2 mt-2 flex justify-between">
              <span className="text-sm font-bold text-warning-dark">SISA HUTANG:</span>
              <span className="text-lg font-bold text-danger-dark text-money">{formatRupiah(remainingDebt)}</span>
            </div>
          </div>

          <form id="payment-form" onSubmit={onSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Nominal Bayar (Rp) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium">Rp</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="input pl-12 h-12 text-lg font-bold" 
                  placeholder="0"
                  required
                  max={remainingDebt}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setAmount(remainingDebt)} className="text-xs bg-dark-100 hover:bg-dark-200 px-2 py-1 rounded text-dark-700">Pelunasan Penuh</button>
                <button type="button" onClick={() => setAmount(Math.floor(remainingDebt / 2))} className="text-xs bg-dark-100 hover:bg-dark-200 px-2 py-1 rounded text-dark-700">Bayar 50%</button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Metode Pembayaran *</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="input bg-white"
              >
                <option value="tunai">Tunai</option>
                <option value="transfer_bank">Transfer Bank</option>
                <option value="qris">QRIS</option>
              </select>
            </div>

            {(paymentMethod === 'transfer_bank' || paymentMethod === 'qris') && (
              <div className="form-group">
                <label className="label text-sm text-dark-600">Rekening Tujuan / Asal *</label>
                <select 
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="input bg-white text-sm"
                  required
                >
                  <option value="" disabled>-- Pilih Rekening --</option>
                  {banks.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {banks.length === 0 && (
                  <p className="text-[10px] text-danger-500 mt-1">Cabang ini belum memiliki Rekening Bank di Pengaturan Cabang.</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="label">Catatan Tambahan (Opsional)</label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input" 
                placeholder="Cth: Pembayaran cicilan 1" 
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-md btn-outline bg-white">
            Batal
          </button>
          <button type="submit" form="payment-form" disabled={loading || (paymentMethod !== 'tunai' && !paymentAccount)} className="btn-md btn-primary">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Proses Pembayaran
          </button>
        </div>
      </div>
    </div>
  )
}
