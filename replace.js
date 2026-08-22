const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/pos/pos-client.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                    <div className="border-t border-dashed border-dark-200 pt-2 mb-4 text-xs">
                      <div className="flex justify-between font-bold text-sm mb-1">
                        <span>TOTAL</span>
                        <span>{formatRupiah(completedTxn.total)}</span>
                      </div>
                      <div className="flex justify-between text-dark-500">
                        <span>BAYAR ({completedTxn.paymentMethod.toUpperCase()}{completedTxn.paymentMethod === 'transfer' && completedTxn.paymentAccount ? \` - \${completedTxn.paymentAccount}\` : ''})</span>
                        <span>{formatRupiah(completedTxn.amountPaid)}</span>
                      </div>
                      {completedTxn.paymentMethod === 'tunai' && (
                        <div className="flex justify-between text-dark-500">
                          <span>KEMBALI</span>
                          <span>{formatRupiah(completedTxn.change)}</span>
                        </div>
                      )}
                      {completedTxn.paymentMethod === 'tempo' && (
                        <div className="flex justify-between text-dark-500">
                          <span>SISA PIUTANG</span>
                          <span>{formatRupiah(completedTxn.debt)}</span>
                        </div>
                      )}
                    </div>`;

const replacement = `                    <div className="border-t border-dashed border-dark-200 pt-2 mb-4 text-xs">
                      <div className="flex justify-between text-dark-500">
                        <span>Sub Total</span>
                        <span>{formatRupiah(completedTxn.items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0))}</span>
                      </div>
                      {completedTxn.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0) > 0 && (
                        <div className="flex justify-between text-dark-500">
                          <span>Diskon</span>
                          <span>{formatRupiah(completedTxn.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0))}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm mt-1 mb-1">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(completedTxn.total)}</span>
                      </div>
                    </div>`;

if (content.indexOf(target) !== -1) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Success UI');
} else {
    console.log('Target UI not found');
}
