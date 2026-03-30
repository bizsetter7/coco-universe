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
        const userId = '83f063a8-a621-4ea6-bc8a-7e108151480f';
        const { data: logs, error } = await supabase
            .from('point_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log(JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error('Fatal:', err);
    }
}

check();
