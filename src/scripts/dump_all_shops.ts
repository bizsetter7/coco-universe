
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

async function dumpShops() {
    console.log("--- Dumping Shops (First 20) with simple query ---");
    // Only select core fields to be lighter
    const { data: shops, error } = await supabase
        .from('shops')
        .select('id, name, shopName, status, user_id, ad_price')
        .order('created_at', { ascending: false }) // Get newest first
        .limit(20);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${shops.length} shops.`);
        shops.forEach(s => {
            const name = s.name || s.shopName || '(No Name)';
            console.log(`ID: ${s.id.substring(0, 8)}... | Name: ${name} | UserID: ${s.user_id} | Status: ${s.status} | Price: ${s.ad_price}`);
        });
    }
}

dumpShops();
