const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ronqwailyistjuyolmyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbnF3YWlseWlzdGp1eW9sbXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODg0NzYsImV4cCI6MjA4NjU2NDQ3Nn0.0dUM7pVc7yClTIZ5J56TZbATzNgi5NGd2NZWLDcKD90';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase.from('inquiries').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Error selecting from inquiries:', error);
        } else {
            console.log('Successfully connected to inquiries table. Count:', data);
        }
    } catch (err) {
        console.error('Catch error:', err);
    }
}

testConnection();
