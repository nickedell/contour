export async function postN8N(path, body) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_N8N_BASE}${path}`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(text || 'N8N error'); }
}

export const n8n = {
  candidates: (args) => postN8N('/contour/personas/candidates', args),
  research:   (payload) => postN8N('/persona-research/create', { payload }),
  save:       (data) => postN8N('/contour/personas/save', data),
};
