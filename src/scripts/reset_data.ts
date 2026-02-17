
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

async function clearData() {
    console.log("--- Clearing ALL Payments and Shops (Fresh Start) ---");

    // 1. Delete Payments
    const { error: pErr } = await supabase
        .from('payments')
        .delete()
        .not('id', 'is', null); // Delete all rows where id is not null

    if (pErr) console.error("Payment Delete Error:", pErr);
    else console.log("Payments cleared.");

    // 2. Delete Shops
    const { error: sErr } = await supabase
        .from('shops')
        .delete()
        .not('id', 'is', null);

    if (sErr) console.error("Shop Delete Error:", sErr);
    else console.log("Shops cleared.");
}

clearData();
