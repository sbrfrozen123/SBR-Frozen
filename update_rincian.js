const fs = require('fs');

// 1. Update page.tsx
const pagePath = 'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/rincian/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');
const pageTarget = `id, qty, unit, unit_price, subtotal, product_name, product_sku,`;
const pageReplacement = `id, qty, unit, unit_price, discount_amount, subtotal, product_name, product_sku,`;
if (pageContent.includes(pageTarget)) {
    pageContent = pageContent.replace(pageTarget, pageReplacement);
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log('Updated page.tsx');
} else {
    console.log('Target not found in page.tsx');
}

// 2. Update rincian-client.tsx
const clientPath = 'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/rincian/rincian-client.tsx';
let clientContent = fs.readFileSync(clientPath, 'utf8');

// CSV Headers
const csvHeadersTarget = `const headers = ['Nomor SO', 'Pelanggan', 'Nama Barang', 'Kuantitas', 'UoM', 'Salesman', 'Nama Kasir', 'Warehouse', 'Metode Pembayaran', 'Harga Jual', 'Payment Amount', 'Catatan']`;
const csvHeadersRep = `const headers = ['Nomor SO', 'Pelanggan', 'Nama Barang', 'Kuantitas', 'UoM', 'Salesman', 'Nama Kasir', 'Warehouse', 'Metode Pembayaran', 'Harga Jual', 'Diskon', 'Jumlah Total', 'Payment Amount', 'Catatan']`;

// CSV Data
const csvDataTarget = `      item.unit_price,
      item.payment_amount,`;
const csvDataRep = `      item.unit_price,
      item.discount || 0,
      item.subtotal || 0,
      item.payment_amount,`;

// detailedItems
const detailedItemsTarget = `          unit_price: item.unit_price,
          subtotal: item.subtotal,
          payment_amount: sale.amount_paid,`;
const detailedItemsRep = `          unit_price: item.unit_price,
          discount: item.discount_amount || 0,
          subtotal: item.subtotal,
          payment_amount: sale.amount_paid,`;

// Table Headers
const tableHeadersTarget = `                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Harga Jual</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Payment<br/>Amount</th>`;
const tableHeadersRep = `                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Harga Jual</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Diskon</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Jumlah Total</th>
                  <th className="py-3 px-2 font-bold text-right whitespace-nowrap">Payment<br/>Amount</th>`;

// Table Body
const tableBodyTarget = `                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.unit_price).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.payment_amount).replace('Rp', '')}</td>`;
const tableBodyRep = `                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.unit_price).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.discount || 0).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.subtotal || 0).replace('Rp', '')}</td>
                    <td className="py-3 px-2 align-top text-right">{formatRupiah(item.payment_amount).replace('Rp', '')}</td>`;

// Table Footer ColSpan
const tableFooterTarget = `<td colSpan={10} className="py-3 px-2 text-right">TOTAL</td>`;
const tableFooterRep = `<td colSpan={12} className="py-3 px-2 text-right">TOTAL</td>`;

if (clientContent.includes(csvHeadersTarget)) clientContent = clientContent.replace(csvHeadersTarget, csvHeadersRep);
if (clientContent.includes(csvDataTarget)) clientContent = clientContent.replace(csvDataTarget, csvDataRep);
if (clientContent.includes(detailedItemsTarget)) clientContent = clientContent.replace(detailedItemsTarget, detailedItemsRep);
if (clientContent.includes(tableHeadersTarget)) clientContent = clientContent.replace(tableHeadersTarget, tableHeadersRep);
if (clientContent.includes(tableBodyTarget)) clientContent = clientContent.replace(tableBodyTarget, tableBodyRep);
if (clientContent.includes(tableFooterTarget)) clientContent = clientContent.replace(tableFooterTarget, tableFooterRep);

fs.writeFileSync(clientPath, clientContent, 'utf8');
console.log('Updated rincian-client.tsx');

