'use client'

import { useState, useMemo } from 'react'
import { Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, ChevronLeft, ChevronDown, ChevronRight, TrendingDown, Package, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface PerSupplierClientProps {
  purchasesData: any[]
  branches: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
}

export default function PerSupplierClient({
  purchasesData,
  branches,
  initialFrom,
  initialTo,
  initialBranch,
}: PerSupplierClientProps) {
  const router = useRouter()
  
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set())

  const formattedFrom = initialFrom
    ? new Date(initialFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''
  const formattedTo = initialTo
    ? new Date(initialTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  const displayBranch =
    initialBranch === 'all' || !initialBranch
      ? '[Semua Cabang]'
      : branches.find((b) => b.id === initialBranch)?.name || '[Semua Cabang]'

  const applyFilter = () => {
    setShowModal(false)
    let url = `/reports/purchases/per-supplier?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const toggleSupplier = (supplierId: string) => {
    setExpandedSuppliers((prev) => {
      const next = new Set(prev)
      if (next.has(supplierId)) next.delete(supplierId)
      else next.add(supplierId)
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set(groupedBySupplier.map((s) => s.supplierId))
    setExpandedSuppliers(allIds)
  }

  const collapseAll = () => {
    setExpandedSuppliers(new Set())
  }

  // Group purchases by supplier
  const groupedBySupplier = useMemo(() => {
    const map: Record<string, {
      supplierId: string
      supplierName: string
      phone: string
      contactPerson: string
      invoices: any[]
      totalAmount: number
      totalLunas: number
      totalTempo: number
      invoiceCount: number
    }> = {}

    purchasesData.forEach((purchase) => {
      const suppId = purchase.suppliers?.id || 'no-supplier'
      const suppName = purchase.suppliers?.name || 'Tanpa Pemasok'

      if (!map[suppId]) {
        map[suppId] = {
          supplierId: suppId,
          supplierName: suppName,
          phone: purchase.suppliers?.phone || '-',
          contactPerson: purchase.suppliers?.contact_person || '-',
          invoices: [],
          totalAmount: 0,
          totalLunas: 0,
          totalTempo: 0,
          invoiceCount: 0,
        }
      }

      const amount = Number(purchase.total_amount) || 0
      map[suppId].invoices.push(purchase)
      map[suppId].totalAmount += amount
      map[suppId].invoiceCount++
      if (purchase.payment_status === 'lunas') {
        map[suppId].totalLunas += amount
      } else {
        map[suppId].totalTempo += amount
      }
    })

    // Sort by totalAmount descending
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [purchasesData])

  // Grand totals
  const grandTotal = useMemo(() => {
    return groupedBySupplier.reduce(
      (acc, s) => ({
        amount: acc.amount + s.totalAmount,
        lunas: acc.lunas + s.totalLunas,
        tempo: acc.tempo + s.totalTempo,
        invoices: acc.invoices + s.invoiceCount,
      }),
      { amount: 0, lunas: 0, tempo: 0, invoices: 0 }
    )
  }, [groupedBySupplier])

  const exportToCSV = () => {
    const rows: any[][] = []
    rows.push([`Laporan Pembelian per Pemasok - SBR Frozen`])
    rows.push([`Periode: ${formattedFrom} s/d ${formattedTo}`])
    rows.push([`Cabang: ${displayBranch}`])
    rows.push([])
    rows.push(['Pemasok', 'No Faktur', 'Tgl Pembelian', 'Cabang', 'Nama Barang', 'Qty', 'UoM', 'Harga Beli', 'Subtotal', 'Total Faktur', 'Status'])

    groupedBySupplier.forEach((supplier) => {
      supplier.invoices.forEach((inv: any) => {
        const items = inv.purchase_items || []
        if (items.length === 0) {
          rows.push([
            supplier.supplierName,
            inv.invoice_number,
            inv.purchase_date,
            inv.branches?.name || '-',
            '-', '-', '-', '-', '-',
            inv.total_amount,
            inv.payment_status === 'lunas' ? 'Lunas' : 'Tempo',
          ])
        } else {
          items.forEach((item: any, i: number) => {
            rows.push([
              i === 0 ? supplier.supplierName : '',
              i === 0 ? inv.invoice_number : '',
              i === 0 ? inv.purchase_date : '',
              i === 0 ? (inv.branches?.name || '-') : '',
              item.products?.name || 'Produk Dihapus',
              item.qty,
              item.products?.unit || '-',
              item.unit_price,
              item.subtotal,
              i === 0 ? inv.total_amount : '',
              i === 0 ? (inv.payment_status === 'lunas' ? 'Lunas' : 'Tempo') : '',
            ])
          })
        }
      })
      // Subtotal row per supplier
      rows.push(['', '', '', '', '', '', '', '', '', `SUBTOTAL ${supplier.supplierName.toUpperCase()}`, supplier.totalAmount])
      rows.push([])
    })

    rows.push(['', '', '', '', '', '', '', '', '', 'GRAND TOTAL', grandTotal.amount])

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell ?? ''}"`).join(','))
      .join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Pembelian_per_Pemasok_${initialFrom}_${initialTo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col items-center py-8 relative font-sans print:bg-white print:py-0 print:block">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .supplier-detail { display: table-row-group !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      {/* Floating Toolbar */}
      <div className="print-hidden sticky top-4 z-40 bg-white shadow-lg border border-dark-200 rounded-full px-6 py-3 flex items-center gap-6 mb-8 transition-all">
        <Link
          href="/reports"
          className="text-dark-500 hover:text-dark-900 transition-colors flex items-center gap-1 border-r border-dark-200 pr-4"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group"
          >
            <Settings2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Parameter</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group"
          >
            <RefreshCw className={cn('w-5 h-5 group-hover:scale-110 transition-transform', isRefreshing && 'animate-spin')} />
            <span className="text-[10px] font-bold mt-1">Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Export</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group"
          >
            <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Print</span>
          </button>
        </div>
      </div>

      {/* Report Document */}
      <div className="bg-white shadow-xl max-w-[1200px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-8">
        
        {/* Document Header */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">SBR FROZEN</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Rekapitulasi Pembelian per Pemasok</h1>
          {initialFrom && initialTo && (
            <p className="text-sm text-dark-700 mt-1">
              Periode: {formattedFrom} s/d {formattedTo}
            </p>
          )}
        </div>

        {/* Info Row */}
        {initialFrom && initialTo && (
          <div className="flex justify-between items-end mb-6 text-xs text-dark-600 border-b border-dark-200 pb-3">
            <span>Cabang : <span className="font-semibold">{displayBranch}</span></span>
            <span className="italic">
              Dicetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Content */}
        {!initialFrom || !initialTo ? (
          <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200 flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-dark-300" />
            <p className="font-medium">Silakan atur Parameter Laporan terlebih dahulu untuk menampilkan data.</p>
          </div>
        ) : groupedBySupplier.length === 0 ? (
          <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200 flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-dark-300" />
            <p className="font-medium">Tidak ada data pembelian pada rentang tanggal dan parameter ini.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8 print-hidden">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Total Pembelian</p>
                <p className="text-xl font-black text-blue-700 mt-1">{formatRupiah(grandTotal.amount)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Jumlah Faktur</p>
                <p className="text-xl font-black text-slate-700 mt-1">{grandTotal.invoices} Faktur</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Total Lunas</p>
                <p className="text-xl font-black text-green-700 mt-1">{formatRupiah(grandTotal.lunas)}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Total Hutang (Tempo)</p>
                <p className="text-xl font-black text-orange-700 mt-1">{formatRupiah(grandTotal.tempo)}</p>
              </div>
            </div>

            {/* Expand/Collapse Controls */}
            <div className="flex justify-between items-center mb-3 print-hidden">
              <h3 className="text-sm font-bold text-dark-700">
                Rincian per Pemasok ({groupedBySupplier.length} pemasok)
              </h3>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={expandAll}
                  className="text-primary-600 hover:text-primary-800 font-semibold underline"
                >
                  Buka Semua
                </button>
                <span className="text-dark-300">|</span>
                <button
                  onClick={collapseAll}
                  className="text-primary-600 hover:text-primary-800 font-semibold underline"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {/* Summary Table */}
            <table className="w-full text-xs mb-8">
              <thead>
                <tr className="border-t-2 border-b-2 border-dark-900 bg-slate-50">
                  <th className="py-3 px-3 text-left font-bold text-dark-900">No</th>
                  <th className="py-3 px-3 text-left font-bold text-dark-900">Nama Pemasok</th>
                  <th className="py-3 px-3 text-left font-bold text-dark-900">Kontak</th>
                  <th className="py-3 px-3 text-center font-bold text-dark-900">Jml Faktur</th>
                  <th className="py-3 px-3 text-right font-bold text-dark-900">Total Lunas</th>
                  <th className="py-3 px-3 text-right font-bold text-dark-900">Total Tempo</th>
                  <th className="py-3 px-3 text-right font-bold text-dark-900">Grand Total</th>
                  <th className="py-3 px-3 text-center font-bold text-dark-900 print:hidden">Detail</th>
                </tr>
              </thead>
              <tbody>
                {groupedBySupplier.map((supplier, idx) => {
                  const isExpanded = expandedSuppliers.has(supplier.supplierId)
                  return (
                    <>
                      {/* Supplier Summary Row */}
                      <tr
                        key={`summary-${supplier.supplierId}`}
                        className={cn(
                          'border-b border-dark-200 hover:bg-blue-50/50 transition-colors cursor-pointer',
                          isExpanded && 'bg-blue-50/30'
                        )}
                        onClick={() => toggleSupplier(supplier.supplierId)}
                      >
                        <td className="py-3 px-3 text-dark-500 font-medium">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'transition-transform duration-200 print:hidden',
                              isExpanded ? 'rotate-90' : 'rotate-0'
                            )}>
                              <ChevronRight className="w-4 h-4 text-primary-500" />
                            </span>
                            <span className="font-semibold text-dark-900">{supplier.supplierName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-dark-600">
                          {supplier.contactPerson !== '-' ? supplier.contactPerson : supplier.phone}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                            <FileText className="w-3 h-3" />
                            {supplier.invoiceCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-green-700 font-semibold">
                          {supplier.totalLunas > 0 ? formatRupiah(supplier.totalLunas).replace('Rp', '') : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">
                          {supplier.totalTempo > 0 ? (
                            <span className="text-orange-600">{formatRupiah(supplier.totalTempo).replace('Rp', '')}</span>
                          ) : (
                            <span className="text-dark-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-dark-900">
                          {formatRupiah(supplier.totalAmount).replace('Rp', '')}
                        </td>
                        <td className="py-3 px-3 text-center print:hidden">
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-1 rounded-full transition-colors',
                            isExpanded ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                          )}>
                            {isExpanded ? 'Tutup' : 'Lihat'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Detail for this Supplier */}
                      {isExpanded && (
                        <tr key={`detail-${supplier.supplierId}`} className="supplier-detail">
                          <td colSpan={8} className="p-0">
                            <div className="bg-slate-50 border-l-4 border-primary-400 mx-4 mb-4 mt-1 rounded-r-lg overflow-hidden">
                              <div className="bg-primary-700 text-white px-4 py-2 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                  <Package className="w-3.5 h-3.5" />
                                  Detail Pembelian — {supplier.supplierName}
                                </span>
                                <span className="text-xs opacity-75">{supplier.invoiceCount} faktur</span>
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200">
                                    <th className="py-2 px-3 text-left font-semibold text-dark-700">No Faktur</th>
                                    <th className="py-2 px-3 text-left font-semibold text-dark-700">Tgl Beli</th>
                                    <th className="py-2 px-3 text-left font-semibold text-dark-700">Cabang</th>
                                    <th className="py-2 px-3 text-left font-semibold text-dark-700">Nama Barang</th>
                                    <th className="py-2 px-3 text-right font-semibold text-dark-700">Qty</th>
                                    <th className="py-2 px-3 text-left font-semibold text-dark-700">UoM</th>
                                    <th className="py-2 px-3 text-right font-semibold text-dark-700">Harga Beli</th>
                                    <th className="py-2 px-3 text-right font-semibold text-dark-700">Subtotal</th>
                                    <th className="py-2 px-3 text-center font-semibold text-dark-700">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {supplier.invoices.map((inv: any) => {
                                    const items = inv.purchase_items || []
                                    const invDate = new Date(inv.purchase_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                    const isLunas = inv.payment_status === 'lunas'

                                    if (items.length === 0) {
                                      return (
                                        <tr key={inv.id} className="hover:bg-white transition-colors">
                                          <td className="py-2 px-3 font-mono text-dark-600">{inv.invoice_number}</td>
                                          <td className="py-2 px-3 text-dark-600">{invDate}</td>
                                          <td className="py-2 px-3 text-dark-600">{inv.branches?.name || '-'}</td>
                                          <td className="py-2 px-3 text-dark-400 italic" colSpan={4}>Tidak ada detail item</td>
                                          <td className="py-2 px-3 text-right font-semibold">{formatRupiah(inv.total_amount).replace('Rp', '')}</td>
                                          <td className="py-2 px-3 text-center">
                                            <span className={cn(
                                              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                              isLunas ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            )}>
                                              {isLunas ? 'Lunas' : 'Tempo'}
                                            </span>
                                          </td>
                                        </tr>
                                      )
                                    }

                                    return items.map((item: any, itemIdx: number) => (
                                      <tr key={`${inv.id}-${item.id}`} className="hover:bg-white transition-colors">
                                        {itemIdx === 0 ? (
                                          <>
                                            <td className="py-2 px-3 font-mono text-dark-600 align-top" rowSpan={items.length}>
                                              {inv.invoice_number}
                                            </td>
                                            <td className="py-2 px-3 text-dark-600 whitespace-nowrap align-top" rowSpan={items.length}>
                                              {invDate}
                                            </td>
                                            <td className="py-2 px-3 text-dark-600 align-top" rowSpan={items.length}>
                                              {inv.branches?.name || '-'}
                                            </td>
                                          </>
                                        ) : null}
                                        <td className="py-2 px-3 text-dark-800">{item.products?.name || 'Produk Dihapus'}</td>
                                        <td className="py-2 px-3 text-right text-dark-700">{Number(item.qty).toLocaleString('id-ID')}</td>
                                        <td className="py-2 px-3 text-dark-500">{item.products?.unit || '-'}</td>
                                        <td className="py-2 px-3 text-right text-dark-700">
                                          {formatRupiah(item.unit_price).replace('Rp', '')}
                                        </td>
                                        <td className="py-2 px-3 text-right font-semibold text-dark-900">
                                          {formatRupiah(item.subtotal).replace('Rp', '')}
                                        </td>
                                        {itemIdx === 0 ? (
                                          <td className="py-2 px-3 text-center align-top" rowSpan={items.length}>
                                            <span className={cn(
                                              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                              isLunas ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            )}>
                                              {isLunas ? 'Lunas' : 'Tempo'}
                                            </span>
                                          </td>
                                        ) : null}
                                      </tr>
                                    ))
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-primary-300 bg-primary-50">
                                    <td colSpan={7} className="py-2 px-3 text-right font-bold text-primary-800 text-xs">
                                      SUBTOTAL {supplier.supplierName.toUpperCase()}
                                    </td>
                                    <td className="py-2 px-3 text-right font-black text-primary-900">
                                      {formatRupiah(supplier.totalAmount).replace('Rp', '')}
                                    </td>
                                    <td></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-b-2 border-dark-900 bg-dark-50 font-bold text-dark-900">
                  <td colSpan={3} className="py-3 px-3 text-right font-bold">GRAND TOTAL ({grandTotal.invoices} Faktur)</td>
                  <td className="py-3 px-3 text-center">{grandTotal.invoices}</td>
                  <td className="py-3 px-3 text-right text-green-700">{formatRupiah(grandTotal.lunas).replace('Rp', '')}</td>
                  <td className="py-3 px-3 text-right text-orange-600">
                    {grandTotal.tempo > 0 ? formatRupiah(grandTotal.tempo).replace('Rp', '') : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-dark-900">{formatRupiah(grandTotal.amount).replace('Rp', '')}</td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>

            {/* Signature Section (Print Only) */}
            <div className="hidden print:flex justify-end mt-16">
              <div className="text-center text-xs text-dark-600">
                <p>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="mt-1 font-semibold">Dibuat Oleh,</p>
                <div className="mt-16 border-t border-dark-500 w-40 mx-auto" />
                <p className="mt-1">(.............................)</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Parameter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Parameter Laporan
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-dark-200 px-6 pt-2">
              <div className="px-4 py-2 text-primary-600 font-semibold border-b-2 border-danger-500">Umum</div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-dark-700 mb-4 border-b border-dark-200 pb-2 uppercase tracking-wide">
                  Rentang Tanggal
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Dari</label>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full border border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 bg-blue-50 text-blue-700 font-medium"
                      />
                      <Calendar className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">s/d</label>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full border border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Calendar className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-dark-700 mb-4 border-b border-dark-200 pb-2 uppercase tracking-wide">
                  Parameter Tambahan
                </h4>
                <div className="flex items-center gap-4">
                  <label className="w-16 text-sm text-dark-700">Cabang</label>
                  <div className="flex-1 relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full border border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                    >
                      <option value="all">[Semua Cabang]</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-dark-200 flex justify-end">
              <button
                onClick={applyFilter}
                disabled={!fromDate || !toDate}
                className="bg-[#1a365d] hover:bg-[#12284c] text-white px-6 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
              >
                Tampilkan Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
