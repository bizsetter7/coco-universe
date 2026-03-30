const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...v] = line.split('=');
    if(key && v) env[key.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    try {
        const userId = '83f063a8-a621-4ea6-bc8a-7e108151480f'; // UUID for 관리자2
        console.log('--- Checking User ID: ' + userId + ' ---');
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        console.log('Profile:', JSON.stringify(profile, null, 2));

        const { data: logs } = await supabase.from('point_logs').select('*').eq('user_id', userId);
        console.log('Logs:', JSON.stringify(logs, null, 2));

        console.log('--- Searching for knockds string in any column ---');
        const { data: allProfiles } = await supabase.from('profiles').select('*');
        const matches = allProfiles.filter(p => JSON.stringify(p).toLowerCase().includes('knockds'));
        console.log('Matches for "knockds":', JSON.stringify(matches, null, 2));

    } catch (err) {
        console.error(err);
    }
}

check();
