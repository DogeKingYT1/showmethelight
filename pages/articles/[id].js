import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchArticle();
    checkAuth();
  }, [id]);

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/articles?limit=100`);
      const data = await res.json();
      const found = data.articles.find(a => a.id === id);
      setArticle(found);

      // Fetch comments
      const commentsRes = await fetch(`/api/comments?articleId=${id}`);
      const commentsData = await commentsRes.json();
      setComments(commentsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function checkAuth() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('smtl_token') : null;
    setLoggedIn(!!token);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!loggedIn) {
      alert('Please log in to comment');
      return;
    }

    try {
      const token = localStorage.getItem('smtl_token');
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ articleId: id, content: newComment })
      });

      if (res.ok) {
        setNewComment('');
        fetchArticle(); // Refresh comments
      } else {
        alert('Failed to post comment');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting comment');
    }
  }

  async function handleLike() {
    if (!loggedIn) {
      alert('Please log in to like articles');
      return;
    }

    try {
      const token = localStorage.getItem('smtl_token');
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ articleId: id })
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Article not found</p>
        <Link href="/feed">← Back to Feed</Link>
      </div>
    );
  }

  const leaningColor = {
    left: '#1976d2',
    center: '#388e3c',
    right: '#d32f2f',
    independent: '#f57c00'
  }[article.leaning] || '#999';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', padding: '16px', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/feed">← Back to Feed</Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <article style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px' }}>
          <h1 style={{ margin: '0 0 16px 0', lineHeight: '1.4' }}>{article.title}</h1>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: leaningColor,
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {article.leaning}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {article.source_name}
            </span>
            <span style={{ color: '#999', fontSize: '14px' }}>
              {article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}
            </span>
          </div>

          {article.image && (
            <img src={article.image} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px', marginBottom: '16px' }} />
          )}

          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
            {article.excerpt || article.content?.slice(0, 300)}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={handleLike}
              style={{
                padding: '8px 16px',
                backgroundColor: liked ? '#d32f2f' : '#e0e0e0',
                color: liked ? '#fff' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {liked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Read Full Article
            </a>
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '24px' }}>
            <h2 style={{ marginTop: 0 }}>Comments ({comments.length})</h2>

            {loggedIn && (
              <form onSubmit={handleComment} style={{ marginBottom: '24px' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    marginBottom: '8px',
                    minHeight: '80px'
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Post Comment
                </button>
              </form>
            )}

            {!loggedIn && (
              <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '24px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#666' }}>
                  <Link href="/admin">Log in</Link> to comment on articles
                </p>
              </div>
            )}

            {comments.length === 0 && (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No comments yet. Be the first to comment!</p>
            )}

            {comments.map(comment => (
              <div key={comment.id} style={{ padding: '12px', borderLeft: '3px solid #ddd', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#1976d2' }}>
                    {comment.profiles?.username || 'Anonymous'}
                  </strong>
                  <span style={{ color: '#999', fontSize: '12px' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: '4px 0', color: '#333' }}>{comment.content}</p>
              </div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
