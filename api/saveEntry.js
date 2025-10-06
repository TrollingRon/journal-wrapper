import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { SUPABASE_URL, SUPABASE_KEY, ACTION_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  // Optional security: require a shared token from the GPT Action
  if (ACTION_TOKEN) {
    const bearer = req.headers['authorization']?.replace('Bearer ', '');
    const header = req.headers['x-action-token'];
    const token = bearer || header;
    if (token !== ACTION_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { date, data } = req.body || {};
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing "data" object' });
  }

  const isoDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from('entries')
    .insert([{ date: isoDate, data }])
    .select('id, date')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, id: row.id, date: row.date });
}
