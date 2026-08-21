const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkStocks() {
  const { data, error } = await supabase.from('product_stocks').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('product_stocks:', data);
  }
}

checkStocks();
