// pages/api/personas/set/[id].js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing set id' });

  // 1) fetch the team (set) meta
  const { data: set, error: e1 } = await supabaseAdmin
    .from('persona_sets')
    .select('id, name, context, tags, meta, created_at')
    .eq('id', id)
    .single();

  if (e1) return res.status(500).json({ error: e1.message });

  // 2) fetch personas in that set
  const { data: personas, error: e2 } = await supabaseAdmin
    .from('personas')
    .select('id, set_id, name, role, tags, data, created_at')
    .eq('set_id', id)
    .order('created_at', { ascending: false });

  if (e2) return res.status(500).json({ error: e2.message });

  return res.status(200).json({ set, personas: personas || [] });
}