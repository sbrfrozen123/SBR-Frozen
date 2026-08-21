'use client'

import { useState } from 'react'
import { Wallet, Landmark, ArrowRightLeft, Plus, Minus, Search, CreditCard } from 'lucide-react'
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
  bankBalances: Record<string, number>
  undefinedBankBalance: number
  branchData: any
  history: any[]
}

export default function CashflowClient({ userId, branchId, initialCash, initialBank, bankBalances, undefinedBankBalance, branchData, history }: CashflowClientProps) {
  // Build bank options from branchData
  const bankOptions: string[] = []
  if (branchData?.bank_name_1) bankOptions.push(branchData.bank_name_1)
  if (branchData?.bank_name_2) bankOptions.push(branchData.bank_name_2)
  
  const [paymentAccount, setPaymentAccount] = useState<string>(bankOptions[0] || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'saldo_awal' | 'setor_kas' | 'tarik_kas' | 'mutasi_ke_bank' | 'mutasi_ke_kas' | 'pendapatan_lain'>('saldo_awal')
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
        payment_method: (type === 'mutasi_ke_bank' || type === 'mutasi_ke_kas') ? 'transfer' : paymentMethod,
          payment_account: paymentAccount,
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

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          {Object.entries(bankBalances).map(([bankName, bal]) => (
            <div key={bankName} className="bg-white rounded-2xl p-6 border border-dark-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-medium">Saldo Bank ({bankName})</p>
                  <p className="text-xl font-bold text-dark-900 mt-1">{formatRupiah(bal)}</p>
                </div>
              </div>
            </div>
          ))}
          {undefinedBankBalance > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-dark-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-medium">Saldo Bank (Lainnya)</p>
                  <p className="text-xl font-bold text-dark-900 mt-1">{formatRupiah(undefinedBankBalance)}</p>
                </div>
              </div>
            </div>
          )}
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
                      {item.type === 'pendapatan_lain' && <span className="text-xs font-bold px-2 py-1 rounded bg-success-100 text-success-700">Pendapatan Lain</span>}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50/50">
              <h2 className="text-lg font-bold text-dark-900">Catat Mutasi Dana</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-dark-600 transition-colors bg-white rounded-lg p-1">✕</button>
            </div>
            
            <form onSubmit={handleMutasi} className="p-6 space-y-5 bg-slate-50">
              <div className="bg-white p-5 rounded-2xl border border-dark-100 shadow-sm space-y-4">
                <div className="form-group">
                  <label className="label">Jenis Transaksi</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="input bg-white font-medium">
                    <option value="saldo_awal">⭐ Input Saldo Awal / Saldo Sekarang</option>
                    <option value="setor_kas">Setor Dana / Modal Masuk</option>
                    <option value="tarik_kas">Tarik Dana / Ambil Uang Pribadi</option>
                    <option value="mutasi_ke_bank">🏦 Mutasi Kas Fisik ke Saldo Bank</option>
                    <option value="mutasi_ke_kas">🏦 Mutasi Saldo Bank ke Kas Fisik</option>
                    <option value="pendapatan_lain">💰 Input Pendapatan Lain-lain</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bank/Akun selector - shown for all types */}
                  {(type === 'mutasi_ke_bank' || type === 'mutasi_ke_kas') && bankOptions.length > 0 && (
                    <div className="form-group md:col-span-2">
                      <label className="label">{type === 'mutasi_ke_bank' ? 'Ke Rekening Bank' : 'Dari Rekening Bank'}</label>
                      <select
                        value={paymentAccount || bankOptions[0]}
                        onChange={(e) => {
                          setPaymentMethod('transfer')
                          setPaymentAccount(e.target.value)
                        }}
                        className="input bg-white font-medium text-blue-700"
                      >
                        {bankOptions.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {(type === 'setor_kas' || type === 'tarik_kas' || type === 'saldo_awal' || type === 'pendapatan_lain') && (
                    <div className="form-group">
                      <label className="label">Target Akun</label>
                      {bankOptions.length > 0 ? (
                        <select 
                          value={paymentMethod === 'tunai' ? 'tunai' : paymentAccount}
                          onChange={(e) => {
                            if (e.target.value === 'tunai') {
                              setPaymentMethod('tunai')
                              setPaymentAccount('')
                            } else {
                              setPaymentMethod('transfer')
                              setPaymentAccount(e.target.value)
                            }
                          }}
                          className="input bg-white"
                        >
                          <option value="tunai">Kas Tunai (Laci Kasir)</option>
                          {bankOptions.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      ) : (
                        <select 
                          value={paymentMethod} 
                          onChange={(e) => setPaymentMethod(e.target.value as any)} 
                          className="input bg-white"
                        >
                          <option value="tunai">Kas Tunai (Laci Kasir)</option>
                          <option value="transfer">Bank / ATM</option>
                        </select>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="label">Nominal Mutasi (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-medium text-sm">Rp</span>
                      <input 
                        type="number" 
                        min="0"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="input pl-10" 
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Keterangan Singkat</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input" 
                    placeholder="Cth: Setor omset mingguan ke BCA"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-md btn-outline bg-white shadow-sm">Batal</button>
                <button type="submit" disabled={loading} className="btn-md btn-primary px-6 shadow-sm">
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
