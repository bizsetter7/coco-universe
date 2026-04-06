import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ronqwailyistjuyolmyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbnF3YWlseWlzdGp1eW9sbXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzUxNzAsImV4cCI6MjA1OTU1MTE3MH0.gy0y6nXnbVTjzfcgaXx3pS9nbP1fifVLyz3EY0jc0.0dUM7pVc7yClTIZ5J56TZbATzNgi5NGd2NZW' // This is the anon key from env output
);

async function check() {
  const { data, error } = await supabase.from('shops').select('*').limit(1);
  if (error) console.error('Error:', error);
  else {
      if (data && data.length > 0) {
          console.log('Columns: ', Object.keys(data[0]).join(', '));
      } else {
          console.log('No data but success');
      }
  }
}
check();
