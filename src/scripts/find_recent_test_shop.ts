
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

async function dumpRecent() {
    console.log("--- Dumping Recent Shops (50) ---");
    const { data: shops, error } = await supabase
        .from('shops')
        .select('id, name, shopName, status, created_at, options')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${shops.length} recent shops.`);
        shops.forEach(s => {
            console.log(`\nID: ${s.id}`);
            console.log(`Name: ${s.name || s.shopName}`);
            console.log(`Created: ${s.created_at}`);
            console.log(`Status: ${s.status}`);
            console.log(`Options:`, JSON.stringify(s.options));
        });
    }
}

dumpRecent();
