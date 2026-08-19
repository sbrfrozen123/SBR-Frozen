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
  
  const text = fs.readFileSync('products_data.txt', 'utf8');
  const lines = text.split('\n').filter(l => l.trim() !== '');
  lines.shift(); // skip header
  
  let successCount = 0;
  
  for (const line of lines) {
    try {
      const parts = line.trim().split(/\s+/);
      
      const no = parts.shift();
      const sku = parts.shift();
      
      const stockStr = parts.pop();
      const unit = parts.pop();
      
      let barcode = null;
      let name = '';
      
      // Heuristic for barcode: if the first remaining part is alphanumeric/parentheses only, and is known barcode
      // Let's just look at the list: AU6, AU7, DUR, TANTUL, CBC, HAT, KUL, PAT, PAB, PAU, SAY, SLICEE, CU10, BK, (90)MD243209158078(91)260215, SON, KERANG, MINI, KEBMIN, POTONG, SOSIS, UDANG, BT, DAGI, BU, IGON, ZZ
      // If we accidentally grab the first word of the name (e.g. AYAM), it will cause duplicate barcodes.
      // So let's check if the first part is one of the known barcodes, or if it doesn't look like a normal word.
      // Actually, to be 100% safe against duplicate barcode errors, we can just catch the error, and if it fails, try with barcode=null.
      
      // Let's try to assume parts[0] is barcode if it doesn't contain lowercase and is not AYAM/BAKSO/DAGING etc.
      const commonFirstWords = ['AYAM', 'BAKSO', 'BAMBOE', 'BASO', 'BEBEK', 'BROKOLI', 'CEDEA', 'CHAMP', 'CIRENG', 'CUMI', 'DAGING', 'DELMONTE', 'DIMSUM', 'DONAT', 'DOSUKA', 'EDAMAME', 'ELAFROZE', 'FIESTA', 'GAS', 'GOURMET', 'GULA', 'HEMATO', 'IKAN', 'ILM', 'INDOMINA', 'IP', 'JAGUNG', 'JAMUR', 'JD', 'JEROAN', 'KACANG', 'KAMBING', 'KAMIL', 'KEBAB', 'KECAP', 'KEJU', 'KENTANG', 'KENZLER', 'KERANG', 'KIKOMAN', 'KONGKEE', 'KULIT', 'LUMPIA', 'M', 'MAYONAIS', 'MAYONASI', 'MC', 'MENTEGA', 'MINI', 'MINYAK', 'MIX', 'MOZARELLA', 'NUGGET', 'OKEY', 'OLAHAN', 'PAHA', 'PUFF', 'RIOS', 'ROTI', 'ROYCO', 'SALAM', 'SALMON', 'SAORI', 'SAOS', 'SARANA', 'SARDEN', 'SARIWANGI', 'SAUS', 'SIOMAY', 'SO', 'SOSIS', 'STKS', 'STOBERI', 'SUSHI', 'TAHU', 'TEMAN', 'TEMPURA', 'TEPUNG', 'TETELAN', 'UDANG', 'VITALIA', 'WIJEN', 'YONNA', 'ZAITUN', 'ZDAGING', 'ZZ'];
      
      if (parts.length > 1 && !commonFirstWords.includes(parts[0])) {
         barcode = parts.shift();
      }
      
      name = parts.join(' ');
      
      const stock = parseFloat(stockStr.replace(',', '.'));
      
      // 1. Check if product exists
      let { data: existingProd } = await supabase.from('products').select('id, name').eq('sku', sku).single();
      
      let productId;
      
      if (!existingProd) {
        // Insert product
        const payload = {
          sku,
          name,
          unit,
          stock_quantity: stock,
          category: 'Umum'
        };
        if (barcode) payload.barcode = barcode;
        
        let { data: newProd, error: insertErr } = await supabase.from('products').insert([payload]).select().single();
        
        if (insertErr && insertErr.code === '23505') {
           // duplicate barcode, try again without barcode
           payload.name = (barcode + ' ' + payload.name).trim();
           delete payload.barcode;
           const res = await supabase.from('products').insert([payload]).select().single();
           if (res.error) {
              console.error(`Error inserting ${payload.name} (SKU: ${sku}):`, res.error.message);
              continue;
           }
           newProd = res.data;
        } else if (insertErr) {
           console.error(`Error inserting ${name} (SKU: ${sku}):`, insertErr.message);
           continue;
        }
        
        productId = newProd.id;
        console.log(`+ Inserted ${payload.name}`);
      } else {
        productId = existingProd.id;
        console.log(`~ Updated ${name} (Already exists)`);
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
          await supabase.from('product_stocks').update({ stock_quantity: stock }).eq('id', existingStock.id);
        } else {
          await supabase.from('product_stocks').insert([{ product_id: productId, warehouse_id: wh.id, stock_quantity: stock }]);
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
