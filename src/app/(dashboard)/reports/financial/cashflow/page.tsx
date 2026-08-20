import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CashflowReportClient from './cashflow-report-client'

export const metadata: Metadata = {
  title: 'Laporan Arus Kas | SBR Frozen',
}

export default async function CashflowReportPage({
  searchParams
}: {
  searchParams: { from?: string, to?: string, branch?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_gudang') {
    redirect('/')
  }

  const { data: branches } = await supabase.from('branches').select('id, name')

  // We need to fetch all types of transactions in the date range to create a chronological ledger
  let cashTxnsQuery = supabase.from('cash_transactions').select('*')
  let posTxnsQuery = supabase.from('transactions').select('id, amount_paid, payment_method, payment_account, created_at, invoice_number, payment_status, branch_id')
  let expenseTxnsQuery = supabase.from('expenses').select('id, amount, payment_method, payment_account, created_at, title, branch_id')
  let purchaseTxnsQuery = supabase.from('purchases').select('id, total_amount, amount_paid, payment_status, payment_method, payment_account, created_at, invoice_number, branch_id')
  let debtPaymentsQuery = supabase.from('debt_payments').select('id, amount, payment_method, payment_account, created_at, branch_id')
  let supplierPaymentsQuery = supabase.from('supplier_payments').select('id, amount, payment_method, payment_account, created_at, branch_id')

  if (searchParams.from && searchParams.to) {
    cashTxnsQuery = cashTxnsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
    posTxnsQuery = posTxnsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
    expenseTxnsQuery = expenseTxnsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
    purchaseTxnsQuery = purchaseTxnsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
    debtPaymentsQuery = debtPaymentsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
    supplierPaymentsQuery = supplierPaymentsQuery.gte('created_at', searchParams.from).lte('created_at', searchParams.to + 'T23:59:59')
  }

  if (searchParams.branch && searchParams.branch !== 'all') {
    cashTxnsQuery = cashTxnsQuery.eq('branch_id', searchParams.branch)
    posTxnsQuery = posTxnsQuery.eq('branch_id', searchParams.branch)
    expenseTxnsQuery = expenseTxnsQuery.eq('branch_id', searchParams.branch)
    purchaseTxnsQuery = purchaseTxnsQuery.eq('branch_id', searchParams.branch)
    debtPaymentsQuery = debtPaymentsQuery.eq('branch_id', searchParams.branch)
    supplierPaymentsQuery = supplierPaymentsQuery.eq('branch_id', searchParams.branch)
  }

  const [
    { data: cashTxns },
    { data: posTxns },
    { data: expenseTxns },
    { data: purchaseTxns },
    { data: debtPaymentsTxns },
    { data: supplierPaymentsTxns }
  ] = await Promise.all([
    cashTxnsQuery, posTxnsQuery, expenseTxnsQuery, purchaseTxnsQuery, debtPaymentsQuery, supplierPaymentsQuery
  ])

  // Process and sort into a single timeline
  const timeline: any[] = []

  ;(cashTxns || []).forEach(ct => {
    let typeName = ''
    let inflow = 0
    let outflow = 0
    if (ct.type === 'saldo_awal') { typeName = 'Saldo Awal'; inflow = ct.amount }
    else if (ct.type === 'setor_kas') { typeName = 'Setor Kas'; inflow = ct.amount }
    else if (ct.type === 'tarik_kas') { typeName = 'Tarik Kas'; outflow = ct.amount }
    else if (ct.type === 'mutasi_ke_bank') { typeName = 'Mutasi Kas ke Bank'; inflow = 0; outflow = 0 } // Internal
    else if (ct.type === 'mutasi_ke_kas') { typeName = 'Mutasi Bank ke Kas'; inflow = 0; outflow = 0 } // Internal

    if (inflow > 0 || outflow > 0) {
      timeline.push({
        date: ct.created_at,
        ref: ct.reference_number || '-',
        description: typeName + (ct.notes ? ` - ${ct.notes}` : ''),
        method: ct.payment_method + (ct.payment_account ? ` - ${ct.payment_account}` : ''),
        inflow,
        outflow,
        branch_id: ct.branch_id
      })
    }
  })

  ;(posTxns || []).forEach(tx => {
    if (tx.amount_paid > 0) {
      timeline.push({
        date: tx.created_at,
        ref: tx.invoice_number,
        description: 'Penjualan (DP/Lunas)',
        method: tx.payment_method + (tx.payment_account ? ` - ${tx.payment_account}` : ''),
        inflow: tx.amount_paid,
        outflow: 0,
        branch_id: tx.branch_id
      })
    }
  })

  ;(expenseTxns || []).forEach(ex => {
    timeline.push({
      date: ex.created_at,
      ref: '-',
      description: `Pengeluaran: ${ex.title}`,
      method: ex.payment_method + (ex.payment_account ? ` - ${ex.payment_account}` : ''),
      inflow: 0,
      outflow: ex.amount,
      branch_id: ex.branch_id
    })
  })

  ;(purchaseTxns || []).forEach(pu => {
    if (pu.amount_paid > 0) {
      timeline.push({
        date: pu.created_at,
        ref: pu.invoice_number,
        description: 'Pembelian (DP/Lunas)',
        method: pu.payment_method + (pu.payment_account ? ` - ${pu.payment_account}` : ''),
        inflow: 0,
        outflow: pu.amount_paid,
        branch_id: pu.branch_id
      })
    }
  })

  ;(debtPaymentsTxns || []).forEach(dp => {
    timeline.push({
      date: dp.created_at,
      ref: '-',
      description: 'Pembayaran Cicilan Piutang',
      method: dp.payment_method + (dp.payment_account ? ` - ${dp.payment_account}` : ''),
      inflow: dp.amount,
      outflow: 0,
      branch_id: dp.branch_id
    })
  })

  ;(supplierPaymentsTxns || []).forEach(sp => {
    timeline.push({
      date: sp.created_at,
      ref: '-',
      description: 'Pembayaran Cicilan Vendor',
      method: sp.payment_method + (sp.payment_account ? ` - ${sp.payment_account}` : ''),
      inflow: 0,
      outflow: sp.amount,
      branch_id: sp.branch_id
    })
  })

  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate cumulative balance
  let runningBalance = 0
  const finalTimeline = timeline.map(t => {
    runningBalance += t.inflow - t.outflow
    return { ...t, balance: runningBalance }
  })

  return (
    <CashflowReportClient 
      timelineData={finalTimeline}
      branches={branches || []}
      initialFrom={searchParams.from || ''}
      initialTo={searchParams.to || ''}
      initialBranch={searchParams.branch || 'all'}
    />
  )
}
