'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Loader2, X, CheckCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'

interface PaymentFormProps {
  transaction: any
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentForm({ transaction, userId, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<'tunai'|'transfer'|'qris'>('tunai')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  const remainingDebt = transaction.total_amount - transaction.amount_paid

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const paymentAmount = Number(amount)
    if (paymentAmount <= 0) {
      toast.error('Nominal pembayaran harus lebih dari 0')
      return
    }
    if (paymentAmount > remainingDebt) {
      toast.error(`Nominal tidak boleh melebihi sisa tagihan (${formatRupiah(remainingDebt)})`)
      return
    }

    setLoading(true)
    try {
      // 1. Insert into debt_payments
      const { error: paymentError } = await supabase
        .from('debt_payments')
        .insert([{
          transaction_id: transaction.id,
          customer_id: transaction.customer_id,
          user_id: userId,
          branch_id: transaction.branch_id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          notes
        }])

      if (paymentError) throw paymentError

      // 2. Update transaction amount_paid and status
      const newAmountPaid = transaction.amount_paid + paymentAmount
      const isFullyPaid = newAmountPaid >= transaction.total_amount
      
      const { error: txnError } = await supabase
        .from('transactions')
        .update({
          amount_paid: newAmountPaid,
          payment_status: isFullyPaid ? 'lunas' : 'piutang'
        })
        .eq('id', transaction.id)

      if (txnError) throw txnError

      // 3. Update customer's current_debt
      if (transaction.customers?.current_debt !== undefined) {
        const newCustomerDebt = Math.max(0, transaction.customers.current_debt - paymentAmount)
        await supabase
          .from('customers')
          .update({ current_debt: newCustomerDebt })
          .eq('id', transaction.customer_id)
      }

      toast.success('Pembayaran cicilan piutang berhasil dicatat!')
      onSuccess()

    } catch (error: any) {
      console.error('Error saving payment:', error)
      toast.error(error.message || 'Gagal menyimpan pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-dark-100 bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-dark-900">Pembayaran Piutang</h2>
          <p className="text-xs text-dark-500 font-mono mt-1">Invoice: {transaction.invoice_number}</p>
        </div>
        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6 p-4 rounded-xl border border-warning-light bg-warning-light/30">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-600">Total Tagihan:</span>
            <span className="font-semibold">{formatRupiah(transaction.total_amount)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-600">Sudah Dibayar (DP):</span>
            <span className="font-semibold text-success-dark">{formatRupiah(transaction.amount_paid)}</span>
          </div>
          <div className="border-t border-warning/20 pt-2 mt-2 flex justify-between">
            <span className="text-sm font-bold text-warning-dark">SISA PIUTANG:</span>
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
              <option value="transfer">Transfer Bank</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Catatan Tambahan (Opsional)</label>
            <input 
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input" 
              placeholder="Cth: Cicilan ke-1 / Referensi Transfer" 
            />
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onCancel} className="btn-md btn-outline bg-white">
          Batal
        </button>
        <button type="submit" form="payment-form" disabled={loading} className="btn-md btn-primary">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Proses Pembayaran
        </button>
      </div>
    </div>
  )
}
