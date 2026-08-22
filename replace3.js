const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/shifts/shifts-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replacement 1: CSV Export Headers
const target1 = `    const headers = ['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Barang Terjual', 'Modal Awal', 'Kas Akhir (Sistem)', 'Kas Akhir (Fisik)', 'Selisih', 'Status']`;
const rep1 = `    const headers = ['Waktu Mulai', 'Waktu Selesai', 'Kasir', 'Barang Terjual', 'Modal Awal', 'Total Penjualan', 'Kas Akhir (Sistem)', 'Kas Akhir (Fisik)', 'Selisih', 'Status']`;

// Replacement 2: CSV Export Data
const target2 = `      const items = (s.shiftItems || []).map(i => \`\${i.name} (\${i.qty})\`).join('; ')
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        start, end, kasir, items,
        s.starting_cash,
        s.ending_cash_system || 0,`;
const rep2 = `      const items = (s.shiftItems || []).map(i => \`\${i.name} (\${i.qty})\`).join('; ')
      const totalPenjualan = (s.shiftItems || []).reduce((sum, i) => sum + (i.subtotal || 0), 0)
      const selisih = (s.ending_cash_actual || 0) - (s.ending_cash_system || 0)
      return [
        start, end, kasir, items,
        s.starting_cash,
        totalPenjualan,
        s.ending_cash_system || 0,`;

// Replacement 3: Table Header
const target3 = `                <th className="text-right">Modal Awal</th>
                <th className="text-right">Kas Akhir (Sistem)</th>`;
const rep3 = `                <th className="text-right">Modal Awal</th>
                <th className="text-right">Total Penjualan</th>
                <th className="text-right">Kas Akhir (Sistem)</th>`;

// Replacement 4: Table Body
const target4 = `                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_system || 0) : '-'}
                      </td>`;
const rep4 = `                        {formatRupiah(shift.starting_cash)}
                      </td>
                      <td className="text-right text-dark-700">
                        {formatRupiah(shift.shiftItems?.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0) || 0)}
                      </td>
                      <td className="text-right text-dark-700">
                        {shift.status === 'closed' ? formatRupiah(shift.ending_cash_system || 0) : '-'}
                      </td>`;

let success = true;
if (content.indexOf(target1) !== -1) content = content.replace(target1, rep1); else { console.log('T1 not found'); success = false; }
if (content.indexOf(target2) !== -1) content = content.replace(target2, rep2); else { console.log('T2 not found'); success = false; }
if (content.indexOf(target3) !== -1) content = content.replace(target3, rep3); else { console.log('T3 not found'); success = false; }
if (content.indexOf(target4) !== -1) content = content.replace(target4, rep4); else { console.log('T4 not found'); success = false; }

if (success) {
    fs.writeFileSync(path, content, 'utf8');
    console.log('Success Shift');
}
