// pages/api/personas/candidates.js
/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
	res.setHeader('Allow', 'POST');
	return res.status(405).end('Method Not Allowed');
  }
  const { role, sector, geo, org_type, limit = 20 } = req.body || {};

  // If you have n8n, forward to it:
  const base = process.env.N8N_BASE_URL;
  const path = process.env.N8N_PERSONAS_CANDIDATES_PATH;
  if (base && path) {
	try {
	  const r = await fetch(`${base}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ role, sector, geo, org_type, limit }),
	  });
	  const json = await r.json();
	  if (!r.ok) throw new Error(json?.error || 'Upstream error');
	  return res.status(200).json(json);
	} catch (e) {
	  return res.status(500).json({ error: e.message });
	}
  }

  // Fallback: return simple mock candidates so the UI works
  const mock = Array.from({ length: Math.min(+limit || 8, 30) }).map((_, i) => ({
	name: `Candidate ${i + 1}`,
	title: role || 'Role',
	company: sector ? `${sector} Co` : 'Company',
	linkedin_url: '',
  }));
  return res.status(200).json({ candidates: mock });
}
