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

async function clearData() {
  console.log('Starting data deletion...');

  const tablesToClear = [
    'cash_transactions',
    'debt_payments',
    'supplier_payments',
    'expenses',
    'transaction_items',
    'transactions',
    'purchase_items',
    'purchases',
    'stock_transfer_items',
    'stock_transfers',
    'stock_adjustments'
  ];

  for (const table of tablesToClear) {
    console.log('Clearing ' + table + '...');
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error('Error clearing ' + table + ':', error);
    } else {
      console.log('Cleared ' + table + '.');
    }
  }

  console.log('Resetting product_stocks...');
  // Update all product_stocks to 0
  const { error: stockError } = await supabase
    .from('product_stocks')
    .update({ stock_quantity: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (stockError) {
    console.error('Error resetting product_stocks:', stockError);
  } else {
    console.log('Reset product_stocks to 0.');
  }

  console.log('Data wipe complete!');
}

clearData();
