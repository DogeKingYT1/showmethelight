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
  if (req.method === 'GET') {
    // GET /api/comments?articleId=xxx
    try {
      const { articleId } = req.query;
      if (!articleId) return res.status(400).json({ error: 'missing_articleId' });

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          user_id,
          profiles:user_id(username)
        `)
        .eq('article_id', articleId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal' });
    }
  }

  if (req.method === 'POST') {
    // POST /api/comments - create a comment
    try {
      const body = await readJson(req);
      const { articleId, content } = body;
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

      if (!articleId || !content) return res.status(400).json({ error: 'missing_fields' });
      if (!token) return res.status(401).json({ error: 'unauthorized' });

      // Get user from token (simplified: in production use proper JWT verification)
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const { data, error } = await supabase
        .from('comments')
        .insert([{ article_id: articleId, user_id: user.id, content }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal' });
    }
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
