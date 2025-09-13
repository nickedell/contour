// pages/api/maps/[slug].js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential.
 */
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();

  if (req.method === 'GET') {
	const { data, error } = await supabaseAdmin
	  .from('maps')
	  .select('*')
	  .eq('slug', slug)
	  .maybeSingle();

	if (error && error.code !== 'PGRST116') {
	  return res.status(500).json({ error: error.message });
	}
	// Return empty shell if missing (so the app can start)
	return res.status(200).json(data || { slug, data: {} });
  }

  if (req.method === 'POST') {
	const body = req.body || {};
	const mapData = body.data ?? {};
	const snapshot = !!body.snapshot;

	const { data: upserted, error: upsertErr } = await supabaseAdmin
	  .from('maps')
	  .upsert({ slug, data: mapData }, { onConflict: 'slug' })
	  .select('*')
	  .single();

	if (upsertErr) return res.status(500).json({ error: upsertErr.message });

	if (snapshot) {
	  const { error: snapErr } = await supabaseAdmin
		.from('map_versions')
		.insert({ map_id: upserted.id, slug, data: mapData });
	  if (snapErr) return res.status(500).json({ error: snapErr.message, map: upserted });
	}

	return res.status(200).json(upserted);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
