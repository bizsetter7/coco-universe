
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

async function dumpRecentFull() {
    console.log("--- Dumping Recent 20 Shops & Payments ---");

    // Shops
    const { data: shops } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    console.log(`\n[SHOPS] Found ${shops?.length || 0}`);
    shops?.forEach(s => {
        console.log(`ID: ${s.id} | Name: ${s.name || s.shopName} | Price: ${s.price} | AdPrice: ${s.ad_price} | Created: ${s.created_at} | Status: ${s.status}`);
        // console.log("Options:", JSON.stringify(s.options));
    });

    // Payments
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    console.log(`\n[PAYMENTS] Found ${payments?.length || 0}`);
    payments?.forEach(p => {
        console.log(`ID: ${p.id} | Amount: ${p.amount} | UserID: ${p.user_id} | Created: ${p.created_at}`);
    });
}

dumpRecentFull();
