const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function run() {
  const { data: s } = await supabase.from('product_stocks').select('*').eq('product_id', '2c6ffdaa-5a00-4249-808e-a2d61adca46d');
  console.log('Stock:', s);
}
run();
