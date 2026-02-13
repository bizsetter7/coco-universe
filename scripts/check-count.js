const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { count: shopCount, error: shopError } = await supabase
        .from('shops')
        .select('*', { count: 'exact', head: true });

    const { count: postCount, error: postError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

    console.log(`Shops in DB: ${shopCount}`);
    console.log(`Posts in DB: ${postCount}`);

    if (shopError) console.error('Shop Error:', shopError);
    if (postError) console.error('Post Error:', postError);
}

check();
