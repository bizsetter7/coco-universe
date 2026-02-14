import { createClient } from '@supabase/supabase-js';

// [Emergency Fallback] Hardcoded credentials to bypass Vercel environment variable issues
// This ensures connection even if Vercel Project Settings are not configured correctly.
const FALLBACK_URL = 'https://ronqwailyistjuyolmyh.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbnF3YWlseWlzdGp1eW9sbXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODg0NzYsImV4cCI6MjA4NjU2NDQ3Nn0.0dUM7pVc7yClTIZ5J56TZbATzNgi5NGd2NZWLDcKD90';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ using HARDCODED fallback credentials because process.env is missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
