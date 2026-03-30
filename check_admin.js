const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { 
        console.error('ListUsers error:', error); 
        return; 
    }
    
    // List all users mapped with their id and email
    const idToEmail = {};
    users.forEach(u => {
        idToEmail[u.id] = u.email;
    });

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').in('role', ['admin', 'master']);
    if (pError) console.error('Profiles error:', pError);

    console.log('--- Admin Profiles ---');
    profiles.forEach(p => {
        console.log(`ID: ${p.id}, Username: ${p.username}, Email: ${idToEmail[p.id]}, Role: ${p.role}`);
    });
}
check();
