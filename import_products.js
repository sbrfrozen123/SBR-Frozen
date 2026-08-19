require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://pwvdommqmtrribxfehnw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmRvbW1xbXRycmlieGZlaG53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwMjg0MSwiZXhwIjoyMTAyMDc4ODQxfQ.IUGCVVj7VtuZ3ZDrLWjA-9QOU5IGIFhX8mxEG5NRLHA'
);

async function importData() {
  console.log('Starting data import...');
  
  // Get all warehouses
  const { data: warehouses, error: whError } = await supabase.from('warehouses').select('*');
  if (whError) {
    console.error('Error fetching warehouses:', whError);
    return;
  }
  console.log(`Found ${warehouses.length} warehouses:`, warehouses.map(w => w.name));

  const text = fs.readFileSync('products_data.txt', 'utf8');
  const lines = text.split('\n').filter(l => l.trim() !== '');
  
  // Skip header
  lines.shift();
  
  let successCount = 0;
  
  for (const line of lines) {
    try {
      // Format is: No PLU Barcode Nama Produk Satuan Stok
      // Example: 1 50000001 AU6 AYAM 0.6 UTUH EKOR 423
      // Some barcodes might be empty: 5 50000017 AYAM 1.1 UTUH PCS 46 (No barcode, it's PLU then Name)
      // We can parse it by matching the pattern.
      // Usually: Number, String (PLU), Optional String (Barcode), Text (Name), String (Unit), Number (Stock)
      
      const match = line.match(/^(\d+)\s+([A-Za-z0-9]+)\s+([A-Za-z0-9\(\)]+)?\s+(.+?)\s+([A-Za-z]+)\s+([\d\,]+)$/);
      
      let sku, barcode, name, unit, stockStr;
      
      if (match) {
        sku = match[2];
        barcode = match[3] || null;
        name = match[4].trim();
        unit = match[5];
        stockStr = match[6];
      } else {
        // Fallback for tricky lines where barcode is missing and Name has numbers
        const parts = line.trim().split(/\s+/);
        // last is stock, 2nd to last is unit
        stockStr = parts.pop();
        unit = parts.pop();
        // first is number
        parts.shift();
        // second is PLU
        sku = parts.shift();
        
        // If the third part looks like a barcode (e.g. all caps/numbers, no spaces, length < 10)
        // Let's assume anything before the actual name.
        if (parts[0] && !parts[0].includes(' ') && parts[0].match(/^[A-Z0-9\(\)]+$/) && parts[0].length <= 15 && parts.length > 1) {
             // Maybe it's a barcode, but let's be careful. Let's just join the rest as name.
             // Wait, if it has no barcode, parts[0] is the start of the name.
             // E.g. AYAM 1.1 UTUH -> parts = ['AYAM', '1.1', 'UTUH']
             // It's safer to just set barcode to null for this fallback.
        }
        name = parts.join(' ');
        barcode = null; // We'll just leave barcode null for tricky ones if regex fails
      }
      
      // Fix some specific tricky lines if they were parsed incorrectly
      // The regex above will capture things mostly correctly. Let's double check.
      // If Name contains the unit at the end, etc.
      
      const stock = parseFloat(stockStr.replace(',', '.'));
      
      // 1. Check if product exists
      let { data: existingProd } = await supabase.from('products').select('id, name').eq('sku', sku).single();
      
      let productId;
      
      if (!existingProd) {
        // Insert product
        const { data: newProd, error: insertErr } = await supabase.from('products').insert([{
          sku,
          barcode,
          name,
          unit,
          stock_quantity: stock,
          category: 'Umum'
        }]).select().single();
        
        if (insertErr) {
          console.error(`Error inserting ${name} (SKU: ${sku}):`, insertErr.message);
          continue;
        }
        productId = newProd.id;
        console.log(`+ Inserted ${name}`);
      } else {
        productId = existingProd.id;
        console.log(`~ Updated ${name} (Already exists)`);
        
        // Optionally update stock_quantity on the product itself
        await supabase.from('products').update({ stock_quantity: stock }).eq('id', productId);
      }
      
      // 2. Insert into product_stocks for both warehouses
      for (const wh of warehouses) {
        const { data: existingStock } = await supabase.from('product_stocks')
          .select('id')
          .eq('product_id', productId)
          .eq('warehouse_id', wh.id)
          .single();
          
        if (existingStock) {
          await supabase.from('product_stocks')
            .update({ stock_quantity: stock })
            .eq('id', existingStock.id);
        } else {
          await supabase.from('product_stocks')
            .insert([{
              product_id: productId,
              warehouse_id: wh.id,
              stock_quantity: stock
            }]);
        }
      }
      
      successCount++;
    } catch (e) {
      console.error('Exception on line:', line, e);
    }
  }
  
  console.log(`Done! Successfully processed ${successCount} out of ${lines.length} products.`);
}

importData();
