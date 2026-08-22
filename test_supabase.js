const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Projects/SBR Frozen/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(2);
    
  console.log("Error:", error);
  console.log("Data keys:", data && data.length > 0 ? Object.keys(data[0]) : "No data");
  console.log("Data:", data);
}

test();
