import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST');
  const { SUPABASE_URL, SUPABASE_KEY } = process.env;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { date, data } = req.body;
  const { error } = await supabase.from('entries').insert([{ date, data }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}
