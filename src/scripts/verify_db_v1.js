
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 읽기
const envPath = path.resolve(__dirname, '../../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
        const [key, ...value] = line.split('=');
        acc[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        return acc;
    }, {});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('--- Checking profiles table columns ---');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching profiles:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        const columns = Object.keys(data[0]);
        const hasUsername = columns.includes('username');
        const hasPoints = columns.includes('points');
        const hasUserId = columns.includes('user_id');
        const hasCredit = columns.includes('credit_balance');

        console.log(`- username: ${hasUsername ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- points: ${hasPoints ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- user_id: ${hasUserId ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- credit_balance: ${hasCredit ? '✅ EXISTS' : '❌ MISSING'}`);
    } else {
        console.log('No data found in profiles table, cannot determine columns via SELECT *');

        // Alternative method: try to select specific columns to see if they fail
        const colToTest = ['username', 'points', 'user_id', 'credit_balance'];
        for (const col of colToTest) {
            const { error: colError } = await supabase.from('profiles').select(col).limit(1);
            console.log(`- ${col}: ${colError ? '❌ MISSING (' + colError.message + ')' : '✅ EXISTS'}`);
        }
    }
}

checkColumns();
