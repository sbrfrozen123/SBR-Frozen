'use client'

import { useEffect } from 'react'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export default function PrintClient({ transaction: txn, settings, format }: { transaction: any, settings: any, format: string }) {
  const printStoreName = txn.branches?.name ? `${settings?.store_name || 'SBR Frozen'} - ${txn.branches.name}` : (settings?.store_name || 'SBR Frozen')
  const printAddress = txn.branches?.address || settings?.store_address
  const printPhone = txn.branches?.phone || settings?.store_phone || '-'
  useEffect(() => {
    // Automatically trigger print dialog after small delay to ensure rendering is done
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (format === 'thermal') {
    return (
      <div id="printable-receipt" className="text-black bg-white mx-auto" style={{ width: '58mm', padding: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" style={{ margin: '0 auto 5px', maxHeight: '40px', objectFit: 'contain' }} />
          ) : (
            <div style={{ margin: '0 auto 5px', padding: '10px', border: '1px dashed #000', display: 'inline-block', fontSize: '10px' }}>LOGO TOKO</div>
          )}
          <br/>
          <strong style={{ fontSize: '14px' }}>{printStoreName}</strong><br/>
          {printAddress && <span>{printAddress}<br/></span>}
          <span>================================</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          No: {txn.invoice_number}<br/>
          Tgl: {formatDateShort(txn.created_at)}<br/>
          Kasir: {txn.profiles?.full_name?.split(' ')[0]}
          {txn.customers?.name && <><br/>Plg: {txn.customers.name}</>}
        </div>
        
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0', marginBottom: '10px' }}>
          {txn.transaction_items.map((item: any, i: number) => (
            <div key={i} style={{ marginBottom: '5px' }}>
              <div>{item.product?.name || 'Produk Tidak Ditemukan'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.qty} {item.product?.unit} x {formatRupiah(item.unit_price).replace('Rp', '').trim()}</span>
                <span>{formatRupiah(item.subtotal).replace('Rp', '').trim()}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>TOTAL</span>
          <span>{formatRupiah(txn.total_amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>BAYAR ({txn.payment_method.toUpperCase()})</span>
          <span>{formatRupiah(txn.amount_paid || txn.total_amount)}</span>
        </div>
        {((txn.amount_paid || txn.total_amount) - txn.total_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>KEMBALI</span>
            <span>{formatRupiah((txn.amount_paid || txn.total_amount) - txn.total_amount)}</span>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span>================================</span><br/>
          <span>{settings?.receipt_footer_text || 'Terima Kasih'}</span><br/>
          <div style={{ marginTop: '5px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>📞 {printPhone}</span>
            {settings?.social_instagram && <span>📸 {settings.social_instagram}</span>}
            {settings?.store_website && <span>🌐 {settings.store_website}</span>}
          </div>
        </div>
      </div>
    )
  }

  // A4 / Faktur Besar Format
  return (
    <div id="printable-receipt" className="bg-white text-black p-8 max-w-4xl mx-auto" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-16 h-16 object-contain flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 text-xs font-bold">LOGO</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider">{printStoreName}</h1>
            <p className="text-gray-600 mt-1 max-w-sm">{printAddress}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">INVOICE</h2>
          <p className="font-bold text-lg">{txn.invoice_number}</p>
          <p className="text-gray-600">Tanggal: {formatDateShort(txn.created_at)}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-gray-500 font-bold uppercase text-sm mb-1">Tagihan Kepada:</h3>
          <p className="font-bold text-lg">{txn.customers?.name || 'Pelanggan Umum'}</p>
          {txn.customers?.address && <p className="text-gray-600 max-w-xs">{txn.customers.address}</p>}
          {txn.customers?.phone && <p className="text-gray-600">{txn.customers.phone}</p>}
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 font-bold uppercase text-sm mb-1">Kasir:</h3>
          <p className="font-bold">{txn.profiles?.full_name}</p>
          <p className="text-gray-600 capitalize">Metode: {txn.payment_method}</p>
        </div>
      </div>

      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 font-bold border-b border-gray-300">Deskripsi Barang</th>
            <th className="py-3 px-4 font-bold border-b border-gray-300 text-center">Qty</th>
            <th className="py-3 px-4 font-bold border-b border-gray-300 text-right">Harga</th>
            <th className="py-3 px-4 font-bold border-b border-gray-300 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {txn.transaction_items.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3 px-4">{item.product?.name}</td>
              <td className="py-3 px-4 text-center">{item.qty} {item.product?.unit}</td>
              <td className="py-3 px-4 text-right">{formatRupiah(item.unit_price)}</td>
              <td className="py-3 px-4 text-right font-medium">{formatRupiah(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2 max-w-sm">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-bold">Total Tagihan</span>
            <span className="font-black text-xl">{formatRupiah(txn.total_amount)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600">
            <span>Sudah Dibayar</span>
            <span>{formatRupiah(txn.amount_paid || txn.total_amount)}</span>
          </div>
          {txn.payment_method === 'tempo' && (
            <div className="flex justify-between py-2 text-red-600 font-bold">
              <span>Sisa Tagihan</span>
              <span>{formatRupiah(txn.total_amount - (txn.amount_paid || 0))}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p className="mb-4">{settings?.receipt_footer_text || 'Terima kasih atas kepercayaan Anda berbelanja di SBR Frozen.'}</p>
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>{printPhone}</span>
          </div>
          {settings?.social_instagram && (
            <div className="flex items-center gap-2">
              <span>📸</span>
              <span>{settings.social_instagram}</span>
            </div>
          )}
          {settings?.store_website && (
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>{settings.store_website}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
