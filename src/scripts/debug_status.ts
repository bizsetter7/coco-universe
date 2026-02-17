
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- Inspecting Latest Shops (Ads) ---");
    const { data: shops, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(3);

    if (shopError) console.error("Shop Error:", shopError);
    else {
        shops.forEach(s => {
            console.log(`[Ad: ${s.name}] ID: ${s.id}`);
            console.log(`  - pay_type: ${s.pay_type}, pay_amount: ${s.pay_amount}`);
            console.log(`  - category: ${s.category}, category_sub: ${s.category_sub}`);
            console.log(`  - region: ${s.region}, work_region_sub: ${s.work_region_sub}`);
            console.log(`  - options:`, JSON.stringify(s.options, null, 2));
        });
    }

    console.log("\n--- Inspecting Latest Payments ---");
    const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (payError) console.error("Payment Error:", payError);
    else {
        payments.forEach(p => {
            console.log(`[Payment: ${p.id}] Status: ${p.status}, Amount: ${p.amount}, Type: ${p.type}`);
            console.log(`  - Ad ID: ${p.ad_id}`);
            console.log(`  - Metadata:`, p.metadata);
        });
    }
}

inspect();
