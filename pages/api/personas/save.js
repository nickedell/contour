// pages/api/personas/save.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 */
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
	res.setHeader('Allow', 'POST');
	return res.status(405).end('Method Not Allowed');
  }
  try {
	const { set, personas } = req.body || {};
	if (!set || !Array.isArray(personas)) {
	  return res.status(400).json({ error: 'Missing set or personas[]' });
	}

	// Insert the set
	const { data: setRows, error: setErr } = await supabaseAdmin
	  .from('persona_sets')
	  .insert(set, { count: 'exact' })
	  .select('*');
	if (setErr) return res.status(500).json({ error: setErr.message });

	const setId = setRows?.[0]?.id;
	if (!setId) return res.status(500).json({ error: 'Failed to create persona set' });

	// Attach set_id to each persona and insert
	const payload = personas.map((p) => ({ ...p, set_id: setId }));
	const { data: people, error: pplErr } = await supabaseAdmin
	  .from('personas')
	  .insert(payload, { count: 'exact' })
	  .select('id');
	if (pplErr) return res.status(500).json({ error: pplErr.message });

	return res.status(200).json({ set_id: setId, persona_ids: (people || []).map(p => p.id) });
  } catch (e) {
	return res.status(500).json({ error: e.message });
  }
}
