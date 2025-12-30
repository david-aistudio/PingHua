import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Fallback ke ANON KEY kalau SERVICE ROLE gak ada (biar gak crash total pas dev/build)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing! Check .env.local');
}

// Client sakti buat Server Side Fetching (Bisa bypass RLS jika pake Service Role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});
