const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    try {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('nickname', 'knockds')
            .maybeSingle();
        
        if (pError) {
            console.error('Profile Error:', pError);
            return;
        }

        if (!profile) {
            console.log('User knockds not found');
            return;
        }

        const { data: logs, error: lError } = await supabase
            .from('point_logs')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (lError) console.error('Logs Error:', lError);

        console.log(JSON.stringify({ profile, logs }, null, 2));
    } catch (err) {
        console.error('Fatal:', err);
    }
}

check();
