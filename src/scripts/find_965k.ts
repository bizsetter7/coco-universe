
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

async function find965k() {
    console.log("--- Searching for 965,000 KRW ---");

    // 1. Search Payments
    const { data: payments, error: pErr } = await supabase
        .from('payments')
        .select('*')
        .or('amount.eq.965000,amount.eq.965000') // Check number/string
        .order('created_at', { ascending: false });

    if (pErr) console.error("Payment Error:", pErr);
    else {
        console.log(`Found ${payments.length} payments of 965,000.`);
        payments.forEach(p => {
            console.log(`[Payment] ID: ${p.id}, UserID: ${p.user_id}, Status: ${p.status}, Created: ${p.created_at}`);
        });

        // If we found a user, let's find their shop
        if (payments.length > 0) {
            const userId = payments[0].user_id;
            console.log(`Checking shop for user: ${userId}`);
            const { data: shops } = await supabase.from('shops').select('*').eq('user_id', userId);
            shops?.forEach(s => {
                console.log(`[Shop] ID: ${s.id}, Name: ${s.name}, Status: ${s.status}, ad_price: ${s.ad_price}`);
            });
        }
    }
}

find965k();
