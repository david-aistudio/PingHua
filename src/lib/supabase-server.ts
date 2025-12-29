import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Warn but don't crash, might be build time
  console.warn('Supabase credentials missing for Server Client!');
}

// Client sakti buat Server Side Fetching (Bisa bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Penting buat server environment
  }
});
