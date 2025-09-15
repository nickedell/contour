// pages/api/maps/[slug]/versions.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 */
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
	res.setHeader('Allow', 'GET');
	return res.status(405).end('Method Not Allowed');
  }
  const slug = String(req.query.slug || '').toLowerCase();

  const { data: map, error: mapErr } = await supabaseAdmin
	.from('maps')
	.select('id')
	.eq('slug', slug)
	.maybeSingle();
  if (mapErr) return res.status(500).json({ error: mapErr.message });
  if (!map) return res.status(200).json([]);

  const { data, error } = await supabaseAdmin
	.from('map_versions')
	.select('version, created_at')
	.eq('map_id', map.id)
	.order('version', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data || []);
}
