// pages/api/personas/persona/[id].js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { data, error } = await supabaseAdmin
      .from('personas')
      .select('id, set_id, name, role, tags, data, created_at')
      .eq('id', id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json({ persona: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}