import { createClient } from '@supabase/supabase-js';

// WARNING: These public anon keys can be exposed in client apps; restrict policies on the backend.
const SUPABASE_URL = 'https://hqltevcnumxqokfzssvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbHRldmNudW14cW9rZnpzc3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjI0MDAsImV4cCI6MjA3MjM5ODQwMH0.wvUfy1z-Vej94eNa7ZvrpS1vpdlJFbYtBjm8auZPyCo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

// Placeholder: functions to sync enrollment/module progress could be added here.
