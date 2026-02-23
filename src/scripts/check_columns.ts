
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("--- Checking 'profiles' table columns ---");

    // Profiles 한 개를 가져와서 키값을 확인 (스키마 정보를 직접 가져오는 API가 제한적일 수 있으므로)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
    } else if (profile) {
        console.log("Current columns in 'profiles':", Object.keys(profile));
        console.log("Sample data:", profile);
    } else {
        console.log("No profiles found to inspect.");
    }
}

checkSchema();
