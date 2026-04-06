require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getColumns(table) {
  // Query a dummy row to see all columns in schema
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) return { table, error: error.message };
  return { table, columns: data && data[0] ? Object.keys(data[0]) : "NO_DATA" };
}

async function check() {
  const shops = await getColumns('shops');
  const payments = await getColumns('payments');
  const notifications = await getColumns('notifications');
  const profiles = await getColumns('profiles');
  
  fs.writeFileSync('full_schema_check.json', JSON.stringify({ shops, payments, notifications, profiles }, null, 2));

  // Also check if ad 145 can be updated manually
  const { error: updateError } = await supabase.from('shops').update({ updated_at: new Date().toISOString() }).eq('id', 145);
  fs.writeFileSync('test_update_status.json', JSON.stringify({ updateError }));
}
check();
