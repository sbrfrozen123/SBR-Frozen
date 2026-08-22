import os

path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/shifts/shifts-client.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchItems logic
old_fetch = '''        const { data: txns } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [] }
        
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
        
        return { ...shift, shiftItems: Object.values(aggregated) }'''

new_fetch = '''        const { data: txns } = await supabase
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
        
        return { ...shift, shiftItems: Object.values(aggregated), totalCash, totalTransfer }'''

content = content.replace(old_fetch, new_fetch)

# 2. Update CSV Headers
old_csv_headers = "const headers = ['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Barang Terjual', 'Modal Awal', 'Total Penjualan', 'Kas Akhir (Sistem)', 'Kas Akhir (Fisik)', 'Selisih', 'Status']"
new_csv_headers = "const headers = ['No', 'Waktu Shift', 'Kasir', 'Nama Barang', 'Quantity', 'Modal Awal', 'Total Penjualan Cash', 'Total Penjualan Transfer/QRS', 'Jumlah Total', 'Selisih', 'Status']"
content = content.replace(old_csv_headers, new_csv_headers)

# 3. Update CSV Row
old_csv_row = '''      const start = format(new Date(s.start_time), 'dd/MM/yyyy HH:mm', { locale: localeID })
      const end = s.end_time ? format(new Date(s.end_time), 'dd/MM/yyyy HH:mm', { locale: localeID }) : '-'
      const kasir = s.user?.full_name || '-'
      const items = (s.shiftItems || []).map(i => ${i.name} ()).join('; ')
      const totalPenjualan = (s.shiftItems || []).reduce((sum, i) => sum + (i.subtotal || 0), 0)
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        start, end, kasir, items,
        s.starting_cash,
        totalPenjualan,
        s.ending_cash_system || 0,
        s.ending_cash_actual || 0,
        selisih,
        s.status === 'closed' ? 'Selesai' : 'Aktif'
      ].join(',')'''

new_csv_row = '''      const waktuShift = format(new Date(s.start_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) + ' sd ' + (s.end_time ? format(new Date(s.end_time), 'dd MMM yyyy, HH:mm', { locale: localeID }) : 'Sekarang')
      const kasir = s.user?.full_name || '-'
      const namaBarang = (s.shiftItems || []).map(i => i.name).join('\\n')
      const qty = (s.shiftItems || []).map(i => ${i.qty} pcs).join('\\n')
      const totalCash = (s as any).totalCash || 0
      const totalTransfer = (s as any).totalTransfer || 0
      const jumlahTotal = totalCash + totalTransfer
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        index + 1, waktuShift, kasir, "", "",
        s.starting_cash,
        totalCash,
        totalTransfer,
        jumlahTotal,
        selisih,
        s.status === 'closed' ? 'Selesai' : 'Aktif'
      ].join(',')'''

content = content.replace("filteredShifts.map(s => {", "filteredShifts.map((s, index) => {")
content = content.replace(old_csv_row, new_csv_row)


# 4. Update Table Headers
old_thead = '''              <tr>
                <th className="w-12 text-center print:border-l">No</th>
                <th>Waktu Shift</th>
                {userRole === 'super_admin' && <th>Kasir</th>}
                <th>Barang Terjual</th>
                <th className="text-right">Modal Awal</th>
                <th className="text-right">Total Penjualan</th>
                <th className="text-right">Kas Akhir (Sistem)</th>
                <th className="text-right">Kas Akhir (Fisik)</th>
                <th className="text-center">Selisih</th>
                <th className="text-center print:border-r">Status</th>
                <th className="w-16 text-center print:hidden">Aksi</th>
              </tr>'''

new_thead = '''              <tr>
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
              </tr>'''
              
content = content.replace(old_thead, new_thead)


# 5. Update Table Body
old_tbody = '''                      <td className="min-w-[200px]">
                        {shift.shiftItems && shift.shiftItems.length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            {shift.shiftItems.map((item: any, i: number) => (
                              <div key={i} className="text-xs flex justify-between gap-2 border-b border-dark-50 pb-1 last:border-0 last:pb-0">
                                <span className="truncate" title={item.name}>{item.name}</span>
                                <span className="font-semibold whitespace-nowrap">{item.qty} pcs</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-dark-400 italic">Belum ada penjualan</span>
                        )}
                      </td>
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.shiftItems?.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0) || 0)}
                      </td>
                      <td className="text-right text-dark-700">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_system || 0) : '-'}
                      </td>
                      <td className="text-right text-dark-900 font-semibold">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_actual || 0) : '-'}
                      </td>
                      <td className="text-center">
                        {shift.status === 'closed' ? (
                          <span className={cn(
                            'font-bold',
                            selisih > 0 ? 'text-success' : selisih < 0 ? 'text-danger' : 'text-dark-400'
                          )}>
                            {selisih === 0 ? 'Seimbang' : selisih > 0 ? + : formatRupiah(selisih)}
                          </span>
                        ) : '-'}
                      </td>'''

new_tbody = '''                      <td className="min-w-[180px] align-top py-2">
                        {shift.shiftItems && shift.shiftItems.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {shift.shiftItems.map((item: any, i: number) => (
                              <div key={i} className="text-xs truncate h-6 flex items-center border-b border-dark-50 last:border-0" title={item.name}>{item.name}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-dark-400 italic">Belum ada penjualan</span>
                        )}
                      </td>
                      <td className="min-w-[80px] align-top py-2 text-right">
                        {shift.shiftItems && shift.shiftItems.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {shift.shiftItems.map((item: any, i: number) => (
                              <div key={i} className="text-xs font-semibold h-6 flex items-center justify-end border-b border-dark-50 last:border-0">{item.qty} pcs</div>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="text-right text-dark-700 align-top py-2">
                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700 align-top py-2">
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
                            {selisih === 0 ? 'Seimbang' : selisih > 0 ? + : formatRupiah(selisih)}
                          </span>
                        ) : '-'}
                      </td>'''

content = content.replace(old_tbody, new_tbody)

# Make sure colSpan is correct when empty
content = content.replace("colSpan={userRole === 'super_admin' ? 10 : 9}", "colSpan={userRole === 'super_admin' ? 12 : 11}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
