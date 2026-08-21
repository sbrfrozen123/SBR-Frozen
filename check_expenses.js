const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

if (!urlMatch || !keyMatch) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('expenses').select('*').limit(1);
  if (error) {
    console.error('Error fetching expenses:', error);
  } else {
    console.log('Expenses table fetched successfully.');
  }

  const { data: d2, error: e2 } = await supabase.from('debt_payments').select('*').limit(1);
  if (e2) console.error('Error debt_payments:', e2);
  else console.log('debt_payments OK');
}

checkSchema();
