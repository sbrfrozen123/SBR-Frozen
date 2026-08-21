const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function run() {
  const { data: p } = await supabase.from('purchases').select('*').limit(1).single();
  console.log('Purchase:', p);
  const { data: pi } = await supabase.from('purchase_items').select('*').eq('purchase_id', p.id);
  console.log('Purchase items:', pi);
}
run();
