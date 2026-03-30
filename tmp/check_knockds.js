const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    console.log('--- Checking knockds user ---');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or('username.ilike.%knockds%,nickname.ilike.%knockds%');
    
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    if (profiles.length === 0) {
        console.log('No profile found matching "knockds"');
        return;
    }

    profiles.forEach(p => {
        console.log(`ID: ${p.id}`);
        console.log(`Username: ${p.username}`);
        console.log(`Nickname: ${p.nickname}`);
        console.log(`Points: ${p.points}`);
        console.log(`Created At: ${p.created_at}`);
        console.log(`Role: ${p.role}`);
        console.log('---');
    });

    // Also check point logs if they exist
    const { data: logs, error: lError } = await supabase
        .from('point_logs')
        .select('*')
        .in('user_id', profiles.map(p => p.id))
        .order('created_at', { ascending: false });
    
    if (lError) {
        console.log('Point logs table might not exist or error:', lError.message);
    } else {
        console.log('--- Point Logs ---');
        logs.forEach(l => {
            console.log(`User: ${l.user_id}, Amount: ${l.amount}, Type: ${l.type}, Date: ${l.created_at}`);
        });
    }
}
check();
