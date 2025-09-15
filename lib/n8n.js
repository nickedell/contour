export const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE;

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
	body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  // Try to parse JSON; surface better errors if HTML sneaks in from 401/404 pages
  let json;
  try { json = JSON.parse(text); } catch {
	const hint = text.slice(0, 180).replace(/\s+/g, ' ');
	throw new Error(`${res.status} ${res.statusText} — expected JSON, got: ${hint}`);
  }
  if (!res.ok) {
	const msg = json?.message || json?.error || `${res.status} ${res.statusText}`;
	throw new Error(`n8n error: ${msg}`);
  }
  return json;
}

export async function getCandidates(payload) {
  if (!N8N_BASE) throw new Error('Missing NEXT_PUBLIC_N8N_BASE');
  console.log('[n8n] candidates: POST', `${N8N_BASE}/contour/personas/candidates`, payload);
  const data = await fetchJSON(`${N8N_BASE}/contour/personas/candidates`, { body: payload });
  console.log('[n8n] candidates: OK', data);
  return data;
}

export async function researchKnownIndividuals(payload) {
  if (!N8N_BASE) throw new Error('Missing NEXT_PUBLIC_N8N_BASE');
  console.log('[n8n] research: POST', `${N8N_BASE}/persona-research/create`, payload);
  const data = await fetchJSON(`${N8N_BASE}/persona-research/create`, { body: payload });
  console.log('[n8n] research: OK', data);
  return data;
}

export async function saveTeam(payload) {
  if (!N8N_BASE) throw new Error('Missing NEXT_PUBLIC_N8N_BASE');
  console.log('[n8n] save: POST', `${N8N_BASE}/contour/personas/save`, payload);
  const data = await fetchJSON(`${N8N_BASE}/contour/personas/save`, { body: payload });
  console.log('[n8n] save: OK', data);
  return data;
}