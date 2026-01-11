import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function fingerprintFor(article) {
  const text = (article.title || '') + (article.content || '') + (article.link || '');
  return crypto.createHash('sha256').update(text).digest('hex');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { leaning, tag, limit = 50, offset = 0 } = req.query;

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
          content,
          published_at,
          created_at,
          tag
        `)
        .order('published_at', { ascending: false });

      if (leaning && leaning !== 'all') {
        query = query.eq('leaning', leaning);
      }

      if (tag) {
        query = query.eq('tag', tag);
      }

      const { data, error, count } = await query
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      return res.status(200).json(data || []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, link, content, leaning = 'center', tag } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title required' });
      }

      const fingerprint = fingerprintFor({ title, content, link });

      // Check if already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('fingerprint', fingerprint)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Article already exists' });
      }

      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            title,
            link: link || null,
            content: content || null,
            leaning,
            fingerprint,
            tag: tag || null,
            published_at: new Date().toISOString(),
            source_name: 'Manual',
            excerpt: content ? content.substring(0, 200) : null
          }
        ])
        .select();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const articleId = req.query.id;

      if (!articleId) {
        return res.status(400).json({ error: 'ID required' });
      }

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
