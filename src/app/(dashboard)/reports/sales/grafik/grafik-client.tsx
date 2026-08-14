'use client'

import { useState, useMemo } from 'react'
import { Printer, Download, RefreshCw, Settings2, X, Calendar, MapPin, User, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GrafikClientProps {
  salesData: any[]
  branches: any[]
  profiles: any[]
  initialFrom: string
  initialTo: string
  initialBranch: string
  initialSalesman: string
}

export default function GrafikClient({
  salesData,
  branches,
  profiles,
  initialFrom,
  initialTo,
  initialBranch,
  initialSalesman
}: GrafikClientProps) {
  const router = useRouter()
  
  const [showModal, setShowModal] = useState(!initialFrom || !initialTo)
  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(initialTo)
  const [branch, setBranch] = useState(initialBranch)
  const [salesman, setSalesman] = useState(initialSalesman)
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formattedFrom = initialFrom ? new Date(initialFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const formattedTo = initialTo ? new Date(initialTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  const displayBranch = initialBranch === 'all' || !initialBranch 
    ? '[Semua Cabang]' 
    : branches.find(b => b.id === initialBranch)?.name || '[Semua Cabang]'

  const applyFilter = () => {
    setShowModal(false)
    let url = `/reports/sales/grafik?from=${fromDate}&to=${toDate}`
    if (branch) url += `&branch=${branch}`
    if (salesman) url += `&salesman=${salesman}`
    router.push(url)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Calculate chart data by salesman
  const chartData = useMemo(() => {
    const dataBySalesman: Record<string, { salesman: string; penjualan: number; kuantitas: number; total: number }> = {}

    salesData.forEach(sale => {
      const salesmanName = sale.profiles?.full_name || 'Tidak Diketahui'
      
      if (!dataBySalesman[salesmanName]) {
        dataBySalesman[salesmanName] = {
          salesman: salesmanName,
          penjualan: 0,
          kuantitas: 0,
          total: 0
        }
      }

      dataBySalesman[salesmanName].penjualan += (sale.total_amount || 0)
      dataBySalesman[salesmanName].total += (sale.amount_paid || sale.total_amount || 0)
      
      const saleQty = sale.transaction_items?.reduce((sum: number, item: any) => sum + (item.qty || 0), 0) || 0
      dataBySalesman[salesmanName].kuantitas += saleQty
    })

    return Object.values(dataBySalesman)
  }, [salesData])

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col items-center py-8 relative font-sans print:bg-white print:py-0 print:block">
      {/* Global CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      {/* Floating Toolbar (Hidden on Print) */}
      <div className="print-hidden sticky top-4 z-40 bg-white shadow-lg border border-dark-200 rounded-full px-6 py-3 flex items-center gap-6 mb-8 transition-all">
        <Link href="/reports" className="text-dark-500 hover:text-dark-900 transition-colors flex items-center gap-1 border-r border-dark-200 pr-4">
          <ChevronLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowModal(true)} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <Settings2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Parameter</span>
          </button>
          <button onClick={handleRefresh} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <RefreshCw className={cn("w-5 h-5 group-hover:scale-110 transition-transform", isRefreshing && "animate-spin")} />
            <span className="text-[10px] font-bold mt-1">Refresh</span>
          </button>
          <button onClick={() => window.print()} className="flex flex-col items-center text-dark-500 hover:text-primary-600 transition-colors group">
            <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Print</span>
          </button>
        </div>
      </div>

      {/* Report Document Page */}
      <div className="bg-white shadow-xl max-w-[1400px] w-full mx-4 min-h-[800px] p-12 print:shadow-none print:m-0 print:max-w-none print:p-0">
        
        {/* Header Document */}
        <div className="text-center mb-10 relative">
          <h2 className="text-sm font-bold text-dark-900 uppercase tracking-widest">SBR FROZEN</h2>
          <h1 className="text-2xl font-bold text-[#800000] mt-1">Grafik Penjualan</h1>
          <p className="text-sm text-dark-700 mt-1">
            Dari {formattedFrom || '-'} s/d {formattedTo || '-'}
          </p>
        </div>

        {/* Info Right */}
        <div className="flex justify-end mb-4">
          <p className="text-xs italic text-dark-600">Cabang : {displayBranch}</p>
        </div>

        {/* Data Chart */}
        <div className="w-full">
          {(!initialFrom || !initialTo) ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Silakan atur Parameter Laporan terlebih dahulu untuk menampilkan data.
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-20 text-dark-400 border-t border-b border-dark-200">
              Tidak ada data penjualan pada rentang tanggal dan parameter ini.
            </div>
          ) : (
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="salesman" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Kuantitas') return [value, name]
                      return [formatRupiah(value), name]
                    }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="penjualan" name="Penjualan" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kuantitas" name="Kuantitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-dark-400 mt-8 border-t border-dark-200 pt-4">
                SBR Frozen System Report
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parameter Modal (Hidden on Print) */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Parameter Laporan</h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-dark-200 px-6 pt-2">
              <div className="px-4 py-2 text-primary-600 font-semibold border-b-2 border-primary-600">Umum</div>
              <div className="px-4 py-2 text-dark-500 font-medium">Kolom</div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg text-dark-700 mb-4 border-b border-dark-200 pb-2">Tanggal</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Dari</label>
                    <div className="flex-1 relative">
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 bg-blue-50 text-blue-700 font-medium"
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
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Calendar className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg text-dark-700 mb-4 border-b border-dark-200 pb-2">Parameter Tambahan</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Cabang <span className="text-danger-500">*</span></label>
                    <div className="flex-1 relative">
                      <select 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                      >
                        <option value="all">[Semua Cabang]</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-16 text-sm text-dark-700">Salesman</label>
                    <div className="flex-1 relative">
                      <select 
                        value={salesman}
                        onChange={(e) => setSalesman(e.target.value)}
                        className="w-full border-dark-200 rounded-lg text-sm pl-3 pr-10 py-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-blue-50/50"
                      >
                        <option value="all">[Semua Salesman]</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                      </select>
                      <User className="w-4 h-4 text-dark-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
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
                Tampilkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
