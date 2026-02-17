
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

async function search() {
    console.log("--- Searching for 'test' in all fields ---");

    // We can't do OR across multiple columns easily with simple Supabase syntax in everyone's version,
    // so we'll do parallel requests.

    const p1 = supabase.from('shops').select('*').ilike('name', '%test%');
    const p2 = supabase.from('shops').select('*').ilike('shopName', '%test%');
    const p3 = supabase.from('shops').select('*').ilike('user_id', '%test%');
    const p4 = supabase.from('shops').select('*').ilike('nickname', '%test%');

    const [r1, r2, r3, r4] = await Promise.all([p1, p2, p3, p4]);

    const allShops = [
        ...(r1.data || []),
        ...(r2.data || []),
        ...(r3.data || []),
        ...(r4.data || [])
    ];

    // Deduplicate by ID
    const unique = new Map();
    allShops.forEach(s => unique.set(s.id, s));

    const results = Array.from(unique.values());

    console.log(`Found ${results.length} unique shops.`);

    results.forEach(s => {
        console.log(`\nID: ${s.id}`);
        console.log(`Name/ShopName: ${s.name} / ${s.shopName}`);
        console.log(`UserID: ${s.user_id}`);
        console.log(`Nickname: ${s.nickname}`);
        console.log(`Status: ${s.status}`);
        console.log(`Options:`, s.options);
    });
}

search();
