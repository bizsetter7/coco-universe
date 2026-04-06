require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('business_address').eq('id', '4178455a-fc94-4be4-9d35-7eb02d0aa008');
  fs.writeFileSync('dev_profile.json', JSON.stringify({ data, error }, null, 2));
}
check();
