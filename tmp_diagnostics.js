const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('C:\\My-site\\p2.브랜드_통합_시스템\\.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
    console.log('--- [DB DIAGNOSTICS] ---');

    // 1. Check Username vs UserID consistency
    console.log('\n[1] Checking profiles consistency (username vs id)...');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, username, role, is_admin, nickname');

    if (pError) {
        console.error('Error fetching profiles:', pError);
    } else {
        const mismatches = profiles.filter(p => p.username !== p.id);
        console.log(`- Total profiles: ${profiles.length}`);
        console.log(`- Mismatches (username !== id): ${mismatches.length}`);
        if (mismatches.length > 0) {
            console.log('Sample mismatches:', mismatches.slice(0, 5));
        }

        // 2. Check Admin role vs is_admin flag sync
        const adminNeedsSync = profiles.filter(p => 
            (p.role === 'admin' || p.role === 'master') && p.is_admin !== true
        );
        console.log(`\n[2] Checking Admin sync (role=admin but is_admin=false)...`);
        console.log(`- Accounts needing sync: ${adminNeedsSync.length}`);
        if (adminNeedsSync.length > 0) {
            console.log('Needs sync IDs:', adminNeedsSync.map(p => p.id));
        }
        
        // 3. Check for Null Nicknames (Identity Check)
        const nullNicknames = profiles.filter(p => !p.nickname);
        console.log(`\n[3] Checking for missing nicknames...`);
        console.log(`- Missing nicknames: ${nullNicknames.length}`);
    }
}

runDiagnostics();
