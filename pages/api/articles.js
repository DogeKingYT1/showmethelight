import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const { leaning, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        link,
        source_name,
        leaning,
        image,
        excerpt,
        published_at,
        created_at
      `)
      .order('published_at', { ascending: false });

    if (leaning && leaning !== 'all') {
      query = query.eq('leaning', leaning);
    }

    const { data, error, count } = await query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    return res.status(200).json({ articles: data, count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
