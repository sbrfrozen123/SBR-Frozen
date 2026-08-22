const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/inventory/transfers/transfers-client.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    setLoading(true)
    try {
      const refNo = \`TRF-\${Date.now()}\``;

const replacement = `    setLoading(true)
    try {
      // CEK STOK DULU (Peringatan Stok Kosong)
      for (const item of items) {
        const { data: stockData } = await supabase.from('product_stocks').select('stock_quantity').eq('product_id', item.product_id).eq('warehouse_id', fromWh).single();
        const currentQty = stockData ? Number(stockData.stock_quantity) : 0;
        if (currentQty <= 0) {
          const product = products.find(p => p.id === item.product_id);
          throw new Error(\`Stok Kosong: Produk \${product?.name || item.product_id} habis di gudang asal.\`);
        }
        if (currentQty < item.qty) {
          const product = products.find(p => p.id === item.product_id);
          throw new Error(\`Stok Tidak Cukup: Produk \${product?.name || item.product_id} hanya tersisa \${currentQty} di gudang asal.\`);
        }
      }

      const refNo = \`TRF-\${Date.now()}\``;

if (content.indexOf(target) !== -1) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Success Transfer');
} else {
    console.log('Target Transfer not found');
}
