const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkPurchases() {
  const { data, error } = await supabase.from('purchases').select('*');
  if (error) console.error(error);
  else console.log('purchases count:', data.length);
}
checkPurchases();
