// pages/api/personas/sets.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary.
 */
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Prefer the summary view if it exists, else fall back to table with a count
  const { data, error } = await supabaseAdmin
    .from('persona_sets_summary')
    .select('*');

  if (error) {
    // Fallback: try persona_sets without the view
    const { data: sets, error: err2 } = await supabaseAdmin
      .from('persona_sets')
      .select('*')
      .order('created_at', { ascending: false });

    if (err2) return res.status(500).json({ error: err2.message });
    return res.status(200).json(sets ?? []);
  }

  return res.status(200).json(data ?? []);
}