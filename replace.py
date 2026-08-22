import sys
path = r"c:\Projects\SBR Frozen\src\app\(dashboard)\pos\pos-client.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                    <div className="border-t border-dashed border-dark-200 pt-2 mb-4 text-xs">
                      <div className="flex justify-between font-bold text-sm mb-1">
                        <span>TOTAL</span>
                        <span>{formatRupiah(completedTxn.total)}</span>
                      </div>
                      <div className="flex justify-between text-dark-500">
                        <span>BAYAR ({completedTxn.paymentMethod.toUpperCase()}{completedTxn.paymentMethod === 'transfer' && completedTxn.paymentAccount ? ` - ${completedTxn.paymentAccount}` : ''})</span>
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
                    </div>"""

replacement = """                    <div className="border-t border-dashed border-dark-200 pt-2 mb-4 text-xs">
                      <div className="flex justify-between text-dark-500">
                        <span>Sub Total</span>
                        <span>{formatRupiah(completedTxn.items.reduce((sum: number, item: any) => sum + (item.qty * item.unit_price), 0))}</span>
                      </div>
                      {completedTxn.items.reduce((sum: number, item: any) => sum + (item.discount_amount || 0), 0) > 0 && (
                        <div className="flex justify-between text-dark-500">
                          <span>Diskon</span>
                          <span>{formatRupiah(completedTxn.items.reduce((sum: number, item: any) => sum + (item.discount_amount || 0), 0))}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm mt-1 mb-1">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(completedTxn.total)}</span>
                      </div>
                    </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Success UI")
else:
    print("Target UI not found")
