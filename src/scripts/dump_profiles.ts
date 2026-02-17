
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

async function dumpProfiles() {
    console.log("--- Dumping Profiles (First 20) ---");
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${users.length} users.`);
        if (users.length > 0) {
            console.log("Keys:", Object.keys(users[0]));
            users.forEach(u => {
                // Try to print relevant fields based on common names
                console.log(`ID: ${u.id}, Nick: ${u.nickname}, Name: ${u.full_name || u.name || u.username}, Email: ${u.email}`);
            });
        }
    }
}

dumpProfiles();
