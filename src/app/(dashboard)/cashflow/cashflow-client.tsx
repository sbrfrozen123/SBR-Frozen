'use client'

import { useState } from 'react'
import { Wallet, Landmark, ArrowRightLeft, Plus, Minus, Search } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface CashflowClientProps {
  userId: string
  branchId: string
  initialCash: number
  initialBank: number
  history: any[]
}

export default function CashflowClient({ userId, branchId, initialCash, initialBank, history }: CashflowClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'saldo_awal' | 'setor_kas' | 'tarik_kas' | 'mutasi_ke_bank' | 'mutasi_ke_kas'>('saldo_awal')
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'qris'>('tunai')
  const [description, setDescription] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleMutasi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return toast.error('Nominal harus lebih dari 0')
    if (!description.trim()) return toast.error('Keterangan wajib diisi')

    setLoading(true)
    try {
      const { error } = await supabase.from('cash_transactions').insert([{
        user_id: userId,
        type,
        amount,
        payment_method: type === 'mutasi_ke_bank' || type === 'mutasi_ke_kas' ? 'tunai' : paymentMethod,
        description
      }])

      if (error) throw error
      
      toast.success('Mutasi dana berhasil dicatat')
      setIsModalOpen(false)
      setAmount(0)
      setDescription('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan mutasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-dark-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Arus Kas & Bank</h1>
          <p className="text-sm text-dark-500">Pantau saldo kasir dan rekening bank perusahaan</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-md btn-primary whitespace-nowrap"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Mutasi Dana Manual
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        
        {/* Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-success-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-success-600 uppercase tracking-wider mb-1">Saldo Kas Tunai</p>
              <p className={`text-3xl font-black ${initialCash < 0 ? 'text-danger-600' : 'text-dark-900'}`}>{formatRupiah(initialCash)}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-success-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">Saldo Bank / ATM</p>
              <p className={`text-3xl font-black ${initialBank < 0 ? 'text-danger-600' : 'text-dark-900'}`}>{formatRupiah(initialBank)}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
              <Landmark className="w-7 h-7 text-primary-600" />
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-dark-900 flex items-center gap-2">
              Riwayat Mutasi Manual
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-dark-100 text-xs font-bold text-dark-500 uppercase tracking-wider">
                  <th className="p-4 w-[180px]">Waktu</th>
                  <th className="p-4 w-[150px]">Jenis Mutasi</th>
                  <th className="p-4 w-[150px]">Sumber/Tujuan</th>
                  <th className="p-4 text-right w-[150px]">Nominal</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 w-[150px]">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-dark-400">Belum ada riwayat mutasi kas manual</td>
                  </tr>
                ) : history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-medium text-dark-900">{formatDateShort(item.created_at)}</div>
                      <div className="text-xs text-dark-400">{new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="p-4">
                      {item.type === 'saldo_awal' && <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-700">Saldo Awal</span>}
                      {item.type === 'setor_kas' && <span className="text-xs font-bold px-2 py-1 rounded bg-success-100 text-success-700">Setor Modal</span>}
                      {item.type === 'tarik_kas' && <span className="text-xs font-bold px-2 py-1 rounded bg-danger-100 text-danger-700">Tarik Saldo</span>}
                      {item.type === 'mutasi_ke_bank' && <span className="text-xs font-bold px-2 py-1 rounded bg-primary-100 text-primary-700">Kas {'->'} Bank</span>}
                      {item.type === 'mutasi_ke_kas' && <span className="text-xs font-bold px-2 py-1 rounded bg-warning-100 text-warning-700">Bank {'->'} Kas</span>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono uppercase bg-dark-50 px-2 py-1 rounded">{item.payment_method}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-dark-900">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="p-4 text-sm text-dark-600">{item.description}</td>
                    <td className="p-4 text-sm text-dark-600">
                      {Array.isArray(item.profiles) ? item.profiles[0]?.full_name : item.profiles?.full_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Mutasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-dark-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-dark-900">Catat Mutasi Dana</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-dark-600">✕</button>
            </div>
            
            <form onSubmit={handleMutasi} className="p-5 space-y-4">
              <div className="form-group">
                <label className="label">Jenis Transaksi</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="input bg-white font-medium">
                  <option value="saldo_awal">⭐ Input Saldo Awal / Saldo Sekarang</option>
                  <option value="setor_kas">Setor Dana / Modal Masuk</option>
                  <option value="tarik_kas">Tarik Dana / Ambil Uang Pribadi</option>
                  <option value="mutasi_ke_bank">Setor Uang Tunai Kasir ke Bank</option>
                  <option value="mutasi_ke_kas">Tarik Uang Bank ke Kasir</option>
                </select>
              </div>

              {(type === 'setor_kas' || type === 'tarik_kas' || type === 'saldo_awal') && (
                <div className="form-group">
                  <label className="label">Target Akun</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="input bg-white">
                    <option value="tunai">Kas Tunai (Laci)</option>
                    <option value="transfer">Bank / ATM</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="label">Nominal Mutasi (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input" 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="label">Keterangan</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input" 
                  placeholder="Cth: Setor omset mingguan ke BCA"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-md btn-outline bg-white">Batal</button>
                <button type="submit" disabled={loading} className="btn-md btn-primary px-6">
                  {loading ? 'Menyimpan...' : 'Simpan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
