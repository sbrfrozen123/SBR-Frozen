'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Ban, Eye, FileText, CheckCircle2, XCircle, MessageCircle, Plus, RefreshCcw, Filter, Clock, Download, Printer, Share2, ChevronDown, User } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface TransactionHistoryProps {
  transactions: any[]
  userRole: string
  branchId: string | null
  settings?: any
}

export default function TransactionHistoryClient({ transactions: initialTransactions, userRole, branchId, settings }: TransactionHistoryProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const supabase = createClient()
  
  // Real Filters
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('pending') // 'all', 'lunas', 'belum_lunas', 'pending', 'processing'

  const pendingCount = transactions.filter(t => t.order_status === 'pending').length;
  const processingCount = transactions.filter(t => t.order_status === 'processing').length;

  const filtered = transactions.filter(t => {
    // Search Filter
    const matchesSearch = 
      t.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.customers?.name?.toLowerCase().includes(search.toLowerCase());
      
    // Status Filter
    let matchesStatus = true;
    if (statusFilter === 'lunas') {
      matchesStatus = t.order_status === 'completed' && t.payment_status === 'lunas';
    } else if (statusFilter === 'belum_lunas') {
      matchesStatus = t.order_status === 'completed' && t.payment_status !== 'lunas';
    } else if (statusFilter === 'pending') {
      matchesStatus = t.order_status === 'pending';
    } else if (statusFilter === 'processing') {
      matchesStatus = t.order_status === 'processing';
    }

    // Date Filter (simple string comparison works for ISO YYYY-MM-DD)
    let matchesDate = true;
    if (startDate && endDate) {
      const txnDate = new Date(t.created_at).toISOString().split('T')[0];
      matchesDate = txnDate >= startDate && txnDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  })

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTxn) return
    if (!voidReason.trim()) {
      toast.error('Alasan pembatalan wajib diisi')
      return
    }

    setIsVoiding(true)
    try {
      const { error } = await supabase.rpc('void_transaction', {
        txn_id: selectedTxn.id,
        void_reason: voidReason
      })

      if (error) throw error

      toast.success('Transaksi berhasil dibatalkan (Voided)')
      // Update local state
      setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, status: 'voided' } : t))
      setSelectedTxn(null)
      setVoidReason('')
    } catch (err: any) {
      toast.error(err.message || 'Gagal membatalkan transaksi')
    } finally {
      setIsVoiding(false)
    }
  }

  const handleAcceptOrder = async () => {
    if (!selectedTxn) return
    setIsApproving(true)
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ order_status: 'processing' })
        .eq('id', selectedTxn.id)

      if (updateError) throw updateError

      toast.success('Pesanan Diterima! Status: Menunggu Proses Packing')
      setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, order_status: 'processing' } : t))
      setSelectedTxn(null)
    } catch (err: any) {
      toast.error(err.message || 'Gagal menerima pesanan')
    } finally {
      setIsApproving(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!selectedTxn) return
    if (!branchId && userRole !== 'super_admin') {
      toast.error('Cabang tidak valid!')
      return
    }

    setIsApproving(true)
    try {
      // 1. Update status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ order_status: 'completed' })
        .eq('id', selectedTxn.id)

      if (updateError) throw updateError

      // 2. Deduct stock for branch
      const txnBranchId = selectedTxn.branch_id || branchId
      for (const item of selectedTxn.transaction_items) {
        // Here we just fetch current stock and subtract. A safer way is using RPC but we'll do simple for now.
        const { data: stockData } = await supabase
          .from('product_stocks')
          .select('stock_quantity')
          .eq('product_id', item.product_id)
          .eq('branch_id', txnBranchId)
          .single()

        if (stockData) {
          await supabase
            .from('product_stocks')
            .update({ stock_quantity: stockData.stock_quantity - item.qty })
            .eq('product_id', item.product_id)
            .eq('branch_id', txnBranchId)
        }
      }

      toast.success('Pesanan Selesai (Faktur terbentuk & Stok terpotong)!')
      setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, order_status: 'completed' } : t))
      setSelectedTxn(null)
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyelesaikan pesanan')
    } finally {
      setIsApproving(false)
    }
  }

  const sendWhatsApp = (txn: any) => {
    let text = `*${settings?.store_name || 'SBR Frozen'}*\n`
    text += `Faktur Penjualan\n`
    text += `No: ${txn.invoice_number}\n`
    text += `--------------------------------\n`
    
    txn.transaction_items?.forEach((item: any) => {
      text += `${item.product_name}\n`
      text += `${item.qty} ${item.unit} x ${formatRupiah(item.unit_price)} = ${formatRupiah(item.subtotal)}\n`
    })
    
    text += `--------------------------------\n`
    text += `Total: *${formatRupiah(txn.total_amount)}*\n`
    text += `Metode: ${txn.payment_method.toUpperCase()}\n\n`
    text += `${settings?.receipt_footer_text || 'Terima kasih!'}\n`

    const phone = txn.customers?.phone ? txn.customers.phone.replace(/[^0-9]/g, '') : ''
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const formatAccurateMoney = (val: number) => {
    return val.toLocaleString('id-ID');
  }

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invoice,Tanggal,Pelanggan,Keterangan,Status,Total\n";

    filtered.forEach(txn => {
      const date = formatDateShort(txn.created_at);
      const customer = txn.customers?.name || txn.profiles?.full_name || '-';
      const sales = txn.profiles?.full_name || '-';
      const desc = txn.transaction_items?.[0]?.product_name ? `${txn.transaction_items[0].product_name} ${txn.transaction_items.length > 1 ? `(+${txn.transaction_items.length-1} lainnya)` : ''}` : txn.payment_method;
      const status = txn.status === 'voided' ? 'Dibatalkan' : (txn.order_status === 'pending' ? 'Diajukan' : txn.order_status === 'processing' ? 'Menunggu Proses' : (txn.payment_status === 'lunas' ? 'Lunas' : 'Belum Lunas'));
      const total = txn.total_amount;
      
      const row = `"${txn.invoice_number}","${date}","${customer}","${sales}","${desc}","${status}","${total}"`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Transaksi_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col space-y-4 animate-fade-in w-full relative">
      
      {/* Top Filter Bar (Accurate Style Layout, App Colors) */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/pos" className="bg-primary-600 text-white px-3 py-1.5 flex items-center justify-center rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium gap-1">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
          <button onClick={() => {
              setStartDate(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
              setStatusFilter('all');
              setSearch('');
            }} 
            className="bg-white border border-dark-200 text-primary-600 px-3 py-1.5 flex items-center justify-center rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
            title="Refresh Data / Reset Filter"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center border border-dark-200 rounded-lg bg-white shadow-sm overflow-hidden h-9">
            <span className="px-3 text-sm text-dark-500 bg-dark-50 border-r border-dark-200 flex items-center h-full">Tanggal</span>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-sm px-2 outline-none text-dark-800 bg-transparent"
            />
            <span className="px-1 text-sm text-dark-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="text-sm px-2 outline-none text-dark-800 bg-transparent"
            />
          </div>
          
          <div className="flex items-center bg-white border border-dark-200 rounded-lg shadow-sm h-9 p-0.5">
            <button 
              onClick={() => setStatusFilter('pending')}
              className={cn("px-3 py-1 text-sm font-medium rounded-md transition-colors", statusFilter === 'pending' ? 'bg-primary-50 text-primary-600' : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50')}
            >
              Diajukan <span className="ml-1 bg-primary-100 text-primary-700 py-0.5 px-1.5 rounded-full text-xs">{pendingCount}</span>
            </button>
            <button 
              onClick={() => setStatusFilter('processing')}
              className={cn("px-3 py-1 text-sm font-medium rounded-md transition-colors", statusFilter === 'processing' ? 'bg-blue-50 text-blue-600' : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50')}
            >
              Menunggu Proses <span className="ml-1 bg-blue-100 text-blue-700 py-0.5 px-1.5 rounded-full text-xs">{processingCount}</span>
            </button>
            <button 
              onClick={() => setStatusFilter('belum_lunas')}
              className={cn("px-3 py-1 text-sm font-medium rounded-md transition-colors", statusFilter === 'belum_lunas' ? 'bg-warning-light/20 text-warning-dark' : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50')}
            >
              Piutang
            </button>
            <button 
              onClick={() => setStatusFilter('lunas')}
              className={cn("px-3 py-1 text-sm font-medium rounded-md transition-colors", statusFilter === 'lunas' ? 'bg-success/10 text-success' : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50')}
            >
              Lunas
            </button>
            <button 
              onClick={() => setStatusFilter('all')}
              className={cn("px-3 py-1 text-sm font-medium rounded-md transition-colors", statusFilter === 'all' ? 'bg-dark-100 text-dark-800' : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50')}
            >
              Semua
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print/Download actions */}
          <div className="flex items-center rounded-lg shadow-sm">
            <button onClick={exportToCSV} className="bg-white border border-dark-200 text-primary-600 px-3 py-1.5 rounded-l-lg hover:bg-primary-50 transition-colors h-9" title="Export CSV"><Download className="w-4 h-4" /></button>
            <button onClick={() => window.print()} className="bg-white border-y border-r border-dark-200 text-primary-600 px-3 py-1.5 rounded-r-lg hover:bg-primary-50 transition-colors h-9" title="Print Tabel"><Printer className="w-4 h-4" /></button>
          </div>

          {/* Search */}
          <div className="flex items-center border border-dark-200 rounded-lg bg-white overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 shadow-sm h-9">
            <input 
              type="text" 
              placeholder="Cari (Invoice, Pelanggan)" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 outline-none w-56 text-dark-800 bg-transparent"
            />
            <button className="px-2 text-dark-400 hover:text-primary-600 border-l border-dark-100 h-full transition-colors"><Search className="w-4 h-4" /></button>
          </div>
          
          {/* Row Count */}
          <div className="bg-white border border-dark-200 text-dark-500 font-medium text-sm px-3 py-1.5 rounded-lg min-w-[40px] text-center shadow-sm h-9 flex items-center justify-center">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Data Table (Accurate Style) */}
      <div className="bg-white border border-dark-200 rounded-xl overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-dark-900 text-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-3 font-semibold text-center w-12 border-r border-dark-700">#</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Nomor #</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Tanggal</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Pelanggan</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Sales/Pembuat</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Keterangan</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Status Pesanan</th>
                <th className="py-3 px-4 font-semibold border-r border-dark-700">Status Pembayaran</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 text-dark-800 bg-white">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-dark-400">Tidak ada data untuk ditampilkan.</td></tr>
              ) : (
                filtered.map((txn, idx) => (
                  <tr 
                    key={txn.id} 
                    onClick={() => setSelectedTxn(txn)}
                    className={cn(
                      'hover:bg-primary-50 cursor-pointer transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                      txn.status === 'voided' ? 'opacity-50 line-through text-dark-400' : ''
                    )}
                  >
                    <td className="py-3 px-3 text-center border-r border-dark-100 flex items-center justify-center">
                      {txn.status === 'voided' ? (
                        <Ban className="w-4 h-4 text-red-500" />
                      ) : txn.order_status === 'pending' ? (
                        <Clock className="w-4 h-4 text-primary-500" />
                      ) : txn.order_status === 'processing' ? (
                        <Clock className="w-4 h-4 text-blue-500" />
                      ) : txn.payment_status !== 'lunas' ? (
                        <Clock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </td>
                    <td className="py-3 px-4 border-r border-dark-100 font-mono text-dark-900">{txn.invoice_number}</td>
                    <td className="py-3 px-4 border-r border-dark-100 text-dark-600">{formatDateShort(txn.created_at)}</td>
                    <td className="py-3 px-4 border-r border-dark-100 font-medium text-dark-800">{txn.customers?.name || '-'}</td>
                    <td className="py-3 px-4 border-r border-dark-100 text-dark-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-dark-400" />
                      {txn.profiles?.full_name}
                    </td>
                    <td className="py-3 px-4 border-r border-dark-100 truncate max-w-[200px] text-dark-600" title={txn.payment_method}>
                      {txn.transaction_items?.[0]?.product_name ? `${txn.transaction_items[0].product_name} ${txn.transaction_items.length > 1 ? `(+${txn.transaction_items.length-1} lainnya)` : ''}` : txn.payment_method}
                    </td>
                    <td className="py-3 px-4 border-r border-dark-100 font-medium">
                      {txn.status === 'voided' 
                        ? <span className="text-danger">Dibatalkan</span>
                        : txn.order_status === 'pending'
                          ? <span className="text-primary-600">Diajukan</span>
                          : txn.order_status === 'processing'
                            ? <span className="text-blue-600">Menunggu Proses</span>
                            : <span className="text-success">Terproses</span>
                      }
                    </td>
                    <td className="py-3 px-4 border-r border-dark-100 font-medium">
                      {txn.status === 'voided' 
                        ? <span className="text-dark-400">-</span>
                        : txn.payment_status === 'lunas'
                          ? <span className="text-success">Lunas</span>
                          : <span className="text-warning">Belum Lunas</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-dark-900 text-money">
                      {formatAccurateMoney(txn.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL / VOID */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-dark-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-dark-900">Detail Transaksi {selectedTxn.invoice_number}</h3>
                <p className="text-xs text-dark-500 mt-1">Kasir: {selectedTxn.profiles?.full_name} | {formatDateShort(selectedTxn.created_at)}</p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="text-dark-400 hover:text-dark-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-auto border-b border-dark-100">
              <h4 className="font-bold text-dark-900 mb-3 text-sm uppercase tracking-wide">Rincian Barang</h4>
              <div className="space-y-3">
                {selectedTxn.transaction_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-dark-50 p-3 rounded-xl">
                    <div>
                      <p className="font-bold text-dark-900 text-sm">{item.product_name}</p>
                      <p className="text-xs text-dark-500">{item.qty} {item.unit} x {formatRupiah(item.unit_price)}</p>
                    </div>
                    <div className="font-bold text-dark-900">{formatRupiah(item.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dark-100 flex justify-between items-center text-lg">
                <div className="flex flex-col">
                  <span className="font-bold text-dark-900">Total</span>
                  <span className={cn("text-xs font-bold uppercase", selectedTxn.payment_status === 'lunas' ? "text-success" : "text-warning")}>
                    {selectedTxn.payment_status === 'lunas' ? "LUNAS" : "BELUM LUNAS (PIUTANG)"}
                  </span>
                </div>
                <span className="font-black text-money text-primary-600">{formatRupiah(selectedTxn.total_amount)}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50">
              {selectedTxn.status === 'voided' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-4 bg-danger-light/10 text-danger-700 rounded-xl border border-danger/20">
                    <Ban className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Transaksi ini telah Dibatalkan (Void)</p>
                      <p className="text-sm mt-1">Nilainya tidak masuk laporan laba/rugi, dan stok barang telah dikembalikan.</p>
                    </div>
                  </div>
                </div>
              ) : selectedTxn.order_status === 'pending' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-4 bg-warning-light/10 text-warning-dark rounded-xl border border-warning/20">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Pesanan Baru (Diajukan)</p>
                      <p className="text-sm mt-1">Pesanan ini dikirim oleh Sales dan belum diproses. Klik Terima untuk mulai memproses (packing).</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/pos?edit=${selectedTxn.id}`)}
                      disabled={isApproving}
                      className="w-1/2 btn-lg bg-white border border-primary text-primary hover:bg-primary-50 text-base h-14 rounded-xl font-bold"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Edit Pesanan
                    </button>
                    <button 
                      onClick={handleAcceptOrder}
                      disabled={isApproving}
                      className="w-1/2 btn-lg btn-primary shadow-glow-primary text-base h-14 rounded-xl"
                    >
                      {isApproving ? 'Menyimpan...' : 'Terima Pesanan'}
                    </button>
                  </div>
                </div>
              ) : selectedTxn.order_status === 'processing' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Menunggu Proses</p>
                      <p className="text-sm mt-1">Pesanan ini sedang dipacking. Jika barang sudah diserahkan ke pelanggan, klik Selesaikan Transaksi untuk memotong stok.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/pos?edit=${selectedTxn.id}`)}
                      disabled={isApproving}
                      className="w-1/3 btn-lg bg-white border border-primary text-primary hover:bg-primary-50 text-base h-14 rounded-xl font-bold"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Edit
                    </button>
                    <button 
                      onClick={handleCompleteOrder}
                      disabled={isApproving}
                      className="w-2/3 btn-lg bg-success hover:bg-success-dark text-white text-base h-14 rounded-xl font-bold shadow-glow-success transition-all flex items-center justify-center gap-2"
                    >
                      {isApproving ? 'Memproses...' : 'Selesaikan (Potong Stok)'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 w-full">
                    <button 
                      type="button" 
                      onClick={() => sendWhatsApp(selectedTxn)}
                      className="btn-md bg-[#25D366] text-white hover:bg-[#1DA851] flex-1 border-none shadow-sm hover:shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" /> WA
                    </button>
                    <a 
                      href={`/print/invoice/${selectedTxn.id}?format=thermal`}
                      target="_blank"
                      className="btn-md bg-dark-900 text-white hover:bg-dark-800 flex-1 border-none shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Thermal 58mm
                    </a>
                    <a 
                      href={`/print/invoice/${selectedTxn.id}?format=a4`}
                      target="_blank"
                      className="btn-md bg-white border border-dark-200 text-dark-700 hover:bg-dark-50 flex-1 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Faktur A4
                    </a>
                  </div>
                  
                  <form onSubmit={handleVoid} className="flex flex-col gap-3 pt-4 border-t border-dark-100">
                  <label className="text-sm font-bold text-danger-600 flex items-center gap-1.5">
                    <Ban className="w-4 h-4" /> Batal Transaksi (Void)
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Alasan pembatalan (wajib isi)..."
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    className="input border-danger/30 focus:border-danger focus:ring-danger/20"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="submit" disabled={isVoiding} className="btn-md btn-danger">
                      {isVoiding ? 'Memproses...' : 'Ya, Batalkan Transaksi Ini'}
                    </button>
                  </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
