const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/shifts/shifts-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update fetchItems to get payment_method and amount_paid
content = content.replace(
  /\.select\('id'\)/,
  ".select('id, payment_method, amount_paid')"
);

content = content.replace(
  /const aggregated = \(items \|\| \[\]\)\.reduce/g,
  `const totalCash = txns.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalTransfer = txns.filter(t => ['transfer', 'qris'].includes(t.payment_method?.toLowerCase() || '')).reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        
        const aggregated = (items || []).reduce`
);

content = content.replace(
  /return \{ \.\.\.shift, shiftItems: Object\.values\(aggregated\) \}/,
  "return { ...shift, shiftItems: Object.values(aggregated), totalCash, totalTransfer }"
);

// Update Export CSV
content = content.replace(
  /const headers = \['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Barang Terjual', 'Modal Awal', 'Total Penjualan', 'Kas Akhir \(Sistem\)', 'Kas Akhir \(Fisik\)', 'Selisih', 'Status'\]/,
  "const headers = ['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Nama Barang', 'Quantity', 'Modal Awal', 'Total Penjualan Cash', 'Total Penjualan Transfer/QRS', 'Jumlah Total', 'Selisih', 'Status']"
);

content = content.replace(
  /const items = \(s\.shiftItems \|\| \[\]\)\.map\(i => `\$\{i\.name\} \(\$\{i\.qty\}\)`\)\.join\('; '\)/,
  "const itemsName = (s.shiftItems || []).map(i => i.name).join('\\n');\n      const itemsQty = (s.shiftItems || []).map(i => `${i.qty} pcs`).join('\\n');"
);

content = content.replace(
  /return \[\s+start, end, kasir, items,\s+s\.starting_cash,\s+totalPenjualan,\s+s\.ending_cash_system \|\| 0,\s+s\.ending_cash_actual \|\| 0,\s+selisih,\s+s\.status === 'closed' \? 'Selesai' : 'Aktif'\s+\]\.join\('.'\)/,
  "" // wait, I'll just use a simpler replace for CSV
);

fs.writeFileSync(path, content, 'utf8');
