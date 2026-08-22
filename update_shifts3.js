const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/shifts/shifts-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update fetchItems logic
const old_fetch = `        const { data: txns } = await supabase
          .from('transactions')
          .select('id, payment_method, amount_paid')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [], totalCash: 0, totalTransfer: 0 }
        
        const totalCash = txns.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalTransfer = txns.filter(t => ['transfer', 'qris'].includes(t.payment_method?.toLowerCase() || '')).reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        
        const txnIds = txns.map(t => t.id)
        const { data: items } = await supabase
          .from('transaction_items')
          .select('product_name, qty, subtotal')
          .in('transaction_id', txnIds)
          
        const aggregated = (items || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.product_name]) {
            acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
          }
          acc[curr.product_name].qty += curr.qty
          acc[curr.product_name].subtotal += curr.subtotal
          return acc
        }, {})
        
        return { ...shift, shiftItems: Object.values(aggregated), totalCash, totalTransfer }`;

const new_fetch = `        const { data: txns } = await supabase
          .from('transactions')
          .select('id, payment_method, amount_paid, total_amount')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [], totalCash: 0, totalTransfer: 0, totalPiutang: 0 }
        
        const totalCash = txns.filter(t => t.payment_method === 'tunai' || t.payment_method === 'cash' || t.payment_method === 'tempo').reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalTransfer = txns.filter(t => ['transfer', 'qris'].includes(t.payment_method?.toLowerCase() || '')).reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalPiutang = txns.filter(t => t.payment_method === 'tempo').reduce((sum, t) => sum + ((t.total_amount || 0) - (t.amount_paid || 0)), 0);
        
        const txnIds = txns.map(t => t.id)
        const { data: items } = await supabase
          .from('transaction_items')
          .select('product_name, qty, subtotal')
          .in('transaction_id', txnIds)
          
        const aggregated = (items || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.product_name]) {
            acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
          }
          acc[curr.product_name].qty += curr.qty
          acc[curr.product_name].subtotal += curr.subtotal
          return acc
        }, {})
        
        return { ...shift, shiftItems: Object.values(aggregated), totalCash, totalTransfer, totalPiutang }`;

content = content.replace(old_fetch, new_fetch);

// 2. Update CSV Headers
const old_csv_headers = "const headers = ['No', 'Waktu Shift', 'Kasir', 'Nama Barang', 'Quantity', 'Modal Awal', 'Total Penjualan Cash', 'Total Penjualan Transfer/QRS', 'Jumlah Total', 'Selisih', 'Status']";
const new_csv_headers = "const headers = ['No', 'Waktu Shift', 'Kasir', 'Nama Barang', 'Quantity', 'Modal Awal', 'CASH', 'TRANSFER', 'PIUTANG', 'TOTAL PENJUALAN', 'Total Uang Fisik', 'Selisih', 'Status']";
content = content.replace(old_csv_headers, new_csv_headers);

// 3. Update CSV Row
const old_csv_row = `      const waktuShift = format(new Date(s.start_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) + ' sd ' + (s.end_time ? format(new Date(s.end_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) : 'Sekarang')
      const kasir = s.user?.full_name || '-'
      const namaBarang = (s.shiftItems || []).map(i => i.name).join('\\n')
      const qty = (s.shiftItems || []).map(i => \`\${i.qty} pcs\`).join('\\n')
      const totalCash = (s as any).totalCash || 0
      const totalTransfer = (s as any).totalTransfer || 0
      const jumlahTotal = totalCash + totalTransfer
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        index + 1, waktuShift, kasir, \`"\${namaBarang}"\`, \`"\${qty}"\`,
        s.starting_cash,
        totalCash,
        totalTransfer,
        jumlahTotal,
        selisih,
        s.status === 'closed' ? 'Selesai' : 'Aktif'
      ].join(',')`;

const new_csv_row = `      const waktuShift = format(new Date(s.start_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) + ' sd ' + (s.end_time ? format(new Date(s.end_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) : 'Sekarang')
      const kasir = s.user?.full_name || '-'
      const namaBarang = (s.shiftItems || []).map(i => i.name).join('\\n')
      const qty = (s.shiftItems || []).map(i => \`\${i.qty} pcs\`).join('\\n')
      const totalCash = (s as any).totalCash || 0
      const totalTransfer = (s as any).totalTransfer || 0
      const totalPiutang = (s as any).totalPiutang || 0
      const totalPenjualan = totalCash + totalTransfer + totalPiutang
      const totalUangFisik = (s.starting_cash || 0) + totalCash
      const selisih = (s.ending_cash_actual || 0) - totalUangFisik
      return [
        index + 1, waktuShift, kasir, \`"\${namaBarang}"\`, \`"\${qty}"\`,
        s.starting_cash,
        totalCash,
        totalTransfer,
        totalPiutang,
        totalPenjualan,
        totalUangFisik,
        selisih,
        s.status === 'closed' ? 'Selesai' : 'Aktif'
      ].join(',')`;

content = content.replace(old_csv_row, new_csv_row);

// 4. Update Table Headers
const old_thead = `              <tr>
                <th className="w-12 text-center print:border-l">No</th>
                <th>Waktu Shift</th>
                {userRole === 'super_admin' && <th>Kasir</th>}
                <th>Nama Barang</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Total Penjualan Cash</th>
                <th className="text-right">Total Penjualan Transfer/QRS</th>
                <th className="text-right">Jumlah Total</th>
                <th className="text-center">Selisih</th>
                <th className="text-center print:border-r">Status</th>
                <th className="w-16 text-center print:hidden">Aksi</th>
              </tr>`;

const new_thead = `              <tr>
                <th className="w-12 text-center print:border-l">No</th>
                <th>Waktu Shift</th>
                {userRole === 'super_admin' && <th>Kasir</th>}
                <th>Nama Barang</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">CASH</th>
                <th className="text-right">TRANSFER</th>
                <th className="text-right">PIUTANG</th>
                <th className="text-right">TOTAL PENJUALAN</th>
                <th className="text-right">Total Uang Fisik</th>
                <th className="text-center">Selisih</th>
                <th className="text-center print:border-r">Status</th>
                <th className="w-16 text-center print:hidden">Aksi</th>
              </tr>`;
              
content = content.replace(old_thead, new_thead);

// 5. Update Table Body
const old_tbody = `                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah((shift as any).totalCash || 0)}
                      </td>
                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah((shift as any).totalTransfer || 0)}
                      </td>
                      <td className="text-right text-dark-900 font-semibold align-top py-2">
                        {formatRupiah(((shift as any).totalCash || 0) + ((shift as any).totalTransfer || 0))}
                      </td>
                      <td className="text-center align-top py-2">
                        {shift.status === 'closed' ? (
                          <span className={cn(
                            'font-bold',
                            selisih > 0 ? 'text-success' : selisih < 0 ? 'text-danger' : 'text-dark-400'
                          )}>
                            {selisih === 0 ? 'Seimbang' : selisih > 0 ? \`+\${formatRupiah(selisih)}\` : formatRupiah(selisih)}
                          </span>
                        ) : '-'}
                      </td>`;

const new_tbody = `                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah((shift as any).totalCash || 0)}
                      </td>
                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah((shift as any).totalTransfer || 0)}
                      </td>
                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah((shift as any).totalPiutang || 0)}
                      </td>
                      <td className="text-right text-dark-900 font-semibold align-top py-2 bg-primary-50/30">
                        {formatRupiah(((shift as any).totalCash || 0) + ((shift as any).totalTransfer || 0) + ((shift as any).totalPiutang || 0))}
                      </td>
                      <td className="text-right text-dark-900 font-bold align-top py-2">
                        {formatRupiah((shift.starting_cash || 0) + ((shift as any).totalCash || 0))}
                      </td>
                      <td className="text-center align-top py-2">
                        {shift.status === 'closed' ? (() => {
                          const uangFisik = (shift.starting_cash || 0) + ((shift as any).totalCash || 0);
                          const currentSelisih = (shift.ending_cash_actual || 0) - uangFisik;
                          return (
                          <span className={cn(
                            'font-bold',
                            currentSelisih > 0 ? 'text-success' : currentSelisih < 0 ? 'text-danger' : 'text-dark-400'
                          )}>
                            {currentSelisih === 0 ? 'Seimbang' : currentSelisih > 0 ? \`+\${formatRupiah(currentSelisih)}\` : formatRupiah(currentSelisih)}
                          </span>
                        )})() : '-'}
                      </td>`;

content = content.replace(old_tbody, new_tbody);

// Update colSpan
content = content.replace("colSpan={userRole === 'super_admin' ? 12 : 11}", "colSpan={userRole === 'super_admin' ? 14 : 13}");

fs.writeFileSync(path, content, 'utf8');
console.log('Update Success');
