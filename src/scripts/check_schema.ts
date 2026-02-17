
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

async function checkSchema() {
    console.log("--- Checking Schema (First 1) ---");
    const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        if (shops.length > 0) {
            console.log("Keys:", Object.keys(shops[0]));
        } else {
            console.log("No shops found.");
        }
    }
}

checkSchema();
