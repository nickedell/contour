// lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only

if (!url || !key) {
  // Helpful error if mis-configured in Netlify
  throw new Error('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
