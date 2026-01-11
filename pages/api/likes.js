import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function readJson(req) {
  if (req.body) return req.body;
  return new Promise((resolve) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => {
      try { resolve(JSON.parse(d || '{}')); }
      catch (e) { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // POST /api/likes - toggle like on an article
    try {
      const body = await readJson(req);
      const { articleId } = body;
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

      if (!articleId) return res.status(400).json({ error: 'missing_articleId' });
      if (!token) return res.status(401).json({ error: 'unauthorized' });

      // Get user from token
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      // Check if already liked
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (existing) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existing.id);
        return res.status(200).json({ liked: false });
      } else {
        // Like
        await supabase.from('likes').insert([{ user_id: user.id, article_id: articleId }]);
        return res.status(200).json({ liked: true });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal' });
    }
  }

  if (req.method === 'GET') {
    // GET /api/likes?articleId=xxx - check if user liked
    try {
      const { articleId } = req.query;
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

      if (!articleId) return res.status(400).json({ error: 'missing_articleId' });
      if (!token) return res.status(401).json({ error: 'unauthorized' });

      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      return res.status(200).json({ liked: !!data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal' });
    }
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
