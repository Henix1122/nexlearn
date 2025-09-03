import { createClient } from '@supabase/supabase-js';

// Environment-based configuration. NEVER commit real keys. Rotate leaked keys immediately.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Provide a runtime diagnostic (non-blocking) without crashing build.
  // eslint-disable-next-line no-console
  console.warn('[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Supabase features may not work.');
}

export const supabase = createClient(SUPABASE_URL || 'http://localhost:54321', SUPABASE_ANON_KEY || 'public-anon-key', {
  auth: { persistSession: true },
});

// Placeholder: functions to sync enrollment/module progress could be added here.
