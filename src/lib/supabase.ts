import { createClient } from '@supabase/supabase-js';

// [Build-time Resilience] Use placeholders if environment variables are missing during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Supabase environment variables are missing in production build. Pre-rendering might fail for dynamic routes.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
