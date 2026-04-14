const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('--- SHOPS ---');
    const { data: shops } = await supabase.from('shops').select('id, user_id, title, status, ad_price, product_type').in('id', [148, 149]);
    console.log(shops);

    console.log('--- PAYMENTS ---');
    const { data: payments } = await supabase.from('payments').select('id, shop_id, user_id, amount, status, created_at').in('shop_id', [148, 149]);
    console.log(payments);
}

check();
