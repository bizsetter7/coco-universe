require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfile() {
    const targetUserId = '9483cd39-6cbc-4228-9502-7142d6ea884b';
    console.log('Checking profile for ID:', targetUserId);
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

    if (error) {
        console.error('Profile fetch error:', error);
    } else {
        console.log('Profile found:', JSON.stringify(profile, null, 2));
    }

    const { data: resume, error: resError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', targetUserId)
        .limit(1);

    if (resError) {
        console.error('Resume fetch error:', resError);
    } else {
        console.log('Resume sample count:', resume.length);
        if (resume.length > 0) {
            console.log('Resume content:', JSON.stringify(resume[0], null, 2));
        }
    }
}

checkProfile();
