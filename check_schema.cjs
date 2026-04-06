require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('shops').select('*').limit(1);
  if (!error && data && data.length > 0) {
      fs.writeFileSync('keys.json', JSON.stringify(Object.keys(data[0])));
  } else {
      fs.writeFileSync('keys.json', JSON.stringify({ error }));
  }

  const { error: err2 } = await supabase.from('shops').update({
     pay_status: '결제완료',
     rejection_history: [],
     approved_at: new Date().toISOString()
  }).eq('id', 'dummy');
  fs.writeFileSync('err.json', JSON.stringify(err2));
}
check();
