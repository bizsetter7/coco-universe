
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

async function findUserAndShop() {
    console.log("--- Finding User 'test_shop' ---");

    // Search profiles
    // Note: column names might be 'login_id', 'email', 'nickname', or 'username' depending on schema.
    // I'll check a few.

    // First, let's just dump ALL profiles (limit 20) to see what we are dealing with if the search fails repeatedly.
    // unlikely to contain PII in a test env dump, but let's be safe and search.

    // Check schema of profiles first? No, let's try a broad search.
    // Assuming 'email' or 'nickname' or 'full_name' exist. 
    // And 'id' is the join key.

    // Search 1: Nickname or Email
    const { data: users, error: uErr } = await supabase
        .from('profiles')
        .select('*')
        .or('nickname.ilike.%test%,email.ilike.%test%');

    if (uErr) {
        console.error("Profile Search Error:", uErr);
    } else {
        console.log(`Found ${users.length} users fetching 'test'.`);
        users.forEach(u => console.log(`[User] ID: ${u.id}, Nick: ${u.nickname}, Email: ${u.email}`));

        if (users.length > 0) {
            const userIds = users.map(u => u.id);
            console.log(`Searching shops for user IDs: ${userIds.join(', ')}`);

            const { data: shops, error: sErr } = await supabase
                .from('shops')
                .select('*')
                .in('user_id', userIds);

            if (sErr) console.error("Shop Search Error:", sErr);
            else {
                console.log(`Found ${shops.length} shops for these users.`);
                shops.forEach(s => {
                    console.log(`[Shop] ID: ${s.id}, Name: ${s.name}, Status: ${s.status}, ad_price: ${s.ad_price}, options: ${JSON.stringify(s.options)}`);
                });
            }
        }
    }
}

findUserAndShop();
