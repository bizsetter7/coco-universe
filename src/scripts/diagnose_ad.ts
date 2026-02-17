
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

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- Diagnosing 'test_shop' ---");

    // 1. Find the shop by partial name
    const { data: shops, error: sErr } = await supabase
        .from('shops')
        .select('*')
        .ilike('name', '%test%'); // simplified search

    if (sErr) {
        console.error("Shop fetch error:", sErr);
    } else {
        console.log(`Found ${shops.length} shops with 'test' in name.`);
        shops.forEach(s => {
            console.log(`\n[Shop] ID: ${s.id}`);
            console.log(`  Name: ${s.name}`);
            console.log(`  Status: ${s.status}`); // Check if active/pending
            console.log(`  Ad Price: ${s.ad_price}`); // Check if 980000
            console.log(`  Price (Legacy): ${s.price}`);
            console.log(`  User ID: ${s.user_id}`);
            console.log(`  Created/Approved: ${s.created_at} / ${s.approved_at}`);
        });

        if (shops.length > 0) {
            const userIds = shops.map(s => s.user_id);
            // 2. Check Payments for these users
            const { data: payments, error: pErr } = await supabase
                .from('payments')
                .select('*')
                .in('user_id', userIds)
                .order('created_at', { ascending: false });

            if (pErr) console.error("Payment error:", pErr);
            else {
                console.log(`\nFound ${payments.length} payments for these users.`);
                payments.forEach(p => {
                    console.log(`  [Payment] Amount: ${p.amount}, Status: ${p.status}, Created: ${p.created_at}`);
                });
            }
        }
    }
}

diagnose();
