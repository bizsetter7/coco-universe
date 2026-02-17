
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- Inspecting 'test_shop' (assuming ID or string match) ---");

    // 1. Find the user/shop
    // Try to find by nickname 'test_shop' or similar if possible, or just dump all shops to find it.
    // Since I don't know the UUID, I'll search by text fields often used for test_shop.

    // Fetch all shops to find the one looking like test_shop
    const { data: shops, error: sErr } = await supabase
        .from('shops')
        .select('*');

    if (sErr) {
        console.error("Shop fetch error:", sErr);
        return;
    }

    const targetShops = shops.filter(s =>
        (s.name && s.name.includes('test')) ||
        (s.shopName && s.shopName.includes('test')) ||
        (s.user_id && s.user_id.includes('test')) // unlikely for UUID but checking
    );

    console.log(`Found ${targetShops.length} potential 'test' shops.`);

    for (const s of targetShops) {
        console.log(`\n[Shop/Ad] ID: ${s.id}, Name: ${s.name || s.shopName}, Status: ${s.status}, Price: ${s.ad_price || s.price}, UserID: ${s.user_id}`);
        console.log(`Updated: ${s.updated_at}, Approved: ${s.approved_at}, Deadline: ${s.deadline}`);
        console.log(`Options:`, s.options);
    }

    // 2. Fetch Payments
    const { data: payments, error: pErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

    if (pErr) {
        console.error("Payment fetch error:", pErr);
        return;
    }

    // Look for payments with amount 980000 or related to these shops
    const relevantPayments = payments.filter(p =>
        p.amount === 980000 || p.amount === '980000' ||
        targetShops.some(s => s.user_id === p.user_id)
    );

    console.log(`\nFound ${relevantPayments.length} relevant payments (980k or matched user).`);
    for (const p of relevantPayments) {
        console.log(`[Payment] ID: ${p.id}, Amount: ${p.amount}, Status: ${p.status}, UserID: ${p.user_id}`);
        console.log(`Metadata:`, p.metadata);
        console.log(`Created: ${p.created_at}`);
    }
}

inspect();
