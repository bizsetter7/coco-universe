const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ronqwailyistjuyolmyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbnF3YWlseWlzdGp1eW9sbXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODg0NzYsImV4cCI6MjA4NjU2NDQ3Nn0.0dUM7pVc7yClTIZ5J56TZbATzNgi5NGd2NZWLDcKD90';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('--- Supabase Table Check ---');

    // Check 'shops' table
    process.stdout.write('Checking "shops" table... ');
    const { data: shopsData, error: shopsError } = await supabase.from('shops').select('id').limit(1);
    if (shopsError) {
        console.log('❌ Error:', shopsError.message);
    } else {
        console.log('✅ OK (Found)');
    }

    // Check 'inquiries' table
    process.stdout.write('Checking "inquiries" table... ');
    const { data: inqData, error: inqError } = await supabase.from('inquiries').select('*').limit(1);
    if (inqError) {
        console.log('❌ Error:', inqError.message);
        console.log('Error Code:', inqError.code);
    } else {
        console.log('✅ OK (Found)');
    }
}

checkTables();
