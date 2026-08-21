const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('C:/Projects/SBR Frozen/.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkQueries() {
  const queries = [
    { name: 'cash_transactions', query: supabase.from('cash_transactions').select('id, type, amount, payment_method, payment_account, description, transaction_date, created_at, user_id, profiles(full_name)').limit(1) },
    { name: 'transactions', query: supabase.from('transactions').select('id, amount_paid, payment_method, payment_account, created_at, invoice_number').limit(1) },
    { name: 'expenses', query: supabase.from('expenses').select('id, amount, payment_method, payment_account, created_at, description').limit(1) },
    { name: 'purchases', query: supabase.from('purchases').select('id, total_amount, amount_paid, payment_method, payment_status, payment_account, created_at').limit(1) },
    { name: 'debt_payments', query: supabase.from('debt_payments').select('id, amount, payment_method, payment_account, created_at').limit(1) },
    { name: 'supplier_payments', query: supabase.from('supplier_payments').select('id, amount, payment_method, payment_account, created_at').limit(1) }
  ];

  for (const q of queries) {
    const { data, error } = await q.query;
    if (error) {
      console.error('Error in ' + q.name + ':', error);
    } else {
      console.log(q.name + ' OK');
    }
  }
}

checkQueries();
