export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end('Method Not Allowed'); }
  const base = process.env.N8N_BASE_URL;
  const path = process.env.N8N_PERSONAS_GENERATE_PATH;
  const auth = process.env.N8N_AUTH_HEADER; // optional
  try {
	const r = await fetch(`${base}${path}`, {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
	  body: JSON.stringify(req.body || {}),
	});
	const json = await r.json();
	if (!r.ok) throw new Error(json?.error || 'Upstream error');
	return res.status(200).json(json);
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
