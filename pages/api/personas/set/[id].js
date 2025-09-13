// pages/api/personas/set/[id].js
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
	res.setHeader('Allow', 'GET');
	return res.status(405).end('Method Not Allowed');
  }
  const id = String(req.query.id || '');

  const { data: set, error: setErr } = await supabaseAdmin
	.from('persona_sets')
	.select('*')
	.eq('id', id)
	.maybeSingle();

  if (setErr) return res.status(500).json({ error: setErr.message });
  if (!set)   return res.status(404).json({ error: 'Not found' });

  const { data: personas, error: pplErr } = await supabaseAdmin
	.from('personas')
	.select('*')
	.eq('set_id', id)
	.order('created_at', { ascending: true });

  if (pplErr) return res.status(500).json({ error: pplErr.message });

  return res.status(200).json({ set, personas: personas || [] });
}
