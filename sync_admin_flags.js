const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('C:\\My-site\\p2.브랜드_통합_시스템\\.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncAdminFlags() {
    console.log('--- [ADMIN FLAG SYNC] ---');

    // 1. Find mismatched admins
    const { data: mismatches, error: fError } = await supabase
        .from('profiles')
        .select('id, username, role, is_admin')
        .in('role', ['admin', 'master'])
        .eq('is_admin', false);

    if (fError) {
        console.error('Error fetching mismatches:', fError);
        return;
    }

    console.log(`Found ${mismatches.length} admins needing sync.`);

    if (mismatches.length === 0) {
        console.log('All admins are already synced! (is_admin=true)');
        return;
    }

    // 2. Perform sync
    const ids = mismatches.map(m => m.id);
    const { error: uError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .in('id', ids);

    if (uError) {
        console.error('Update error:', uError);
    } else {
        console.log(`Successfully synced is_admin=true for ${ids.length} accounts.`);
    }
}

syncAdminFlags();
