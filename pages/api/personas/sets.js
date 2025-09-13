// pages/api/personas/sets.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Try the summary view first (if you created it)
  const tryView = await supabaseAdmin
    .from('persona_sets_summary')
    .select('*');

  if (!tryView.error && Array.isArray(tryView.data)) {
    return res.status(200).json(tryView.data);
  }

  // Fallback: no view — use nested select and count in JS
  const { data, error } = await supabaseAdmin
    .from('persona_sets')
    .select('id,name,context,tags,meta,created_at, personas:personas(id)')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const rows = (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    context: s.context,
    tags: s.tags,
    meta: s.meta,
    created_at: s.created_at,
    persona_count: Array.isArray(s.personas) ? s.personas.length : 0,
  }));

  return res.status(200).json(rows);
}
