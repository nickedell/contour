// lib/supabaseAdmin.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL env var');
if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var');

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
