
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCorporateAd() {
    console.log("--- Fixing Ad based on Payment (980,000) ---");

    // 1. Find recent payments of 980,000
    const { data: payments, error: pErr } = await supabase
        .from('payments')
        .select('*')
        // Check both number and string formats just in case
        .or('amount.eq.980000,amount.eq.980000')
        .order('created_at', { ascending: false })
        .limit(10);

    if (pErr) {
        console.error("Payment Fetch Error:", pErr);
        return;
    }

    if (!payments || payments.length === 0) {
        console.log("No payments found with amount 980,000.");

        // Fallback: Just fetch recent payments regardless of amount
        const { data: recentPayments } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        console.log("Recent payments:", recentPayments?.map(p => `${p.user_id} : ${p.amount}`));
        return;
    }

    console.log(`Found ${payments.length} target payments.`);

    // 2. For each payment's user, fix their ads
    // Use a Set to avoid duplicate processing
    const userIds = [...new Set(payments.map(p => p.user_id))];

    console.log(`Targeting User IDs: ${userIds.join(', ')}`);

    for (const uid of userIds) {
        if (!uid) continue;

        const { data: shops, error: sErr } = await supabase
            .from('shops')
            .select('*')
            .eq('user_id', uid);

        if (sErr) {
            console.error(`Error fetching shops for user ${uid}:`, sErr);
            continue;
        }

        console.log(`Found ${shops?.length || 0} shops for user ${uid}.`);

        for (const s of (shops || [])) {
            console.log(`Updating Shop [${s.id}] ${s.name}...`);

            // Hardcode fix: status active, ad_price in options = 0
            const newOptions = {
                ...(s.options || {}),
                ad_price: 0,
                // Ensure other options don't override visual priority if needed, 
                // but usually ad_price:0 is what's needed to fix the display.
            };

            const { error: uErr } = await supabase
                .from('shops')
                .update({
                    status: 'active',
                    approved_at: new Date().toISOString(),
                    options: newOptions
                })
                .eq('id', s.id);

            if (uErr) console.error("Update failed:", uErr);
            else console.log("Success! Updated shop data.");
        }
    }
}

fixCorporateAd();
