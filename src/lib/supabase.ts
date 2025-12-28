import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkxNDcxNywiZXhwIjoyMDgyNDkwNzE3fQ.8nr8a_JwwZX-j3KA27d17dyWRQrnSPiKL8abdqLJMZs';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check your .env file.');
}

// Client standar buat publik
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client sakti buat urusan admin (Storage, dsb)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
