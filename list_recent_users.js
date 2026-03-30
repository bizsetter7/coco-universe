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
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .gte('created_at', yesterday);
        
        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Fatal:', err);
    }
}

check();
