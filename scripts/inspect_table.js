const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase environment variables are missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable() {
    console.log('--- Inspecting "messages" table ---');
    
    // 1. Try to insert a dummy record to see structure or just select *
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Select error:', error);
    } else {
        console.log('Sample Data:', data);
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot infer columns from data.');
            // Try to insert a row with all expected columns to see which one fails
            console.log('Attempting dry-run insert to check columns...');
        }
    }
}

inspectTable();
