import { useState, useEffect } from 'react';
import Link from 'next/link';

const LEANINGS = [
  { value: 'all', label: 'All News', color: '#808080' },
  { value: 'left', label: 'Left', color: '#1976d2' },
  { value: 'center', label: 'Center', color: '#388e3c' },
  { value: 'right', label: 'Right', color: '#d32f2f' },
  { value: 'independent', label: 'Independent', color: '#f57c00' }
];

export default function Feed() {
  const [leaning, setLeaning] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [leaning]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const query = leaning === 'all' ? '' : `&leaning=${leaning}`;
      const res = await fetch(`/api/articles?limit=20&offset=0${query}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setOffset(0);
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  const currentLeaning = LEANINGS.find(l => l.value === leaning);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '20px', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ margin: 0 }}>News Feed</h1>
            <div>
              <Link href="/login" style={{ marginRight: '16px', textDecoration: 'none', color: '#1976d2' }}>
                Login
              </Link>
              <Link href="/admin" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Admin
              </Link>
            </div>
          </div>

          {/* Bias Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LEANINGS.map(l => (
              <button
                key={l.value}
                onClick={() => setLeaning(l.value)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: leaning === l.value ? l.color : '#e0e0e0',
                  color: leaning === l.value ? '#fff' : '#333',
                  fontWeight: leaning === l.value ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {loading && <p style={{ textAlign: 'center', color: '#999' }}>Loading articles...</p>}

        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <p style={{ color: '#999', fontSize: '16px' }}>No articles found for this filter.</p>
            <p style={{ color: '#ccc', fontSize: '14px' }}>Try a different leaning or check back later.</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article }) {
  const leaningColor = {
    left: '#1976d2',
    center: '#388e3c',
    right: '#d32f2f',
    independent: '#f57c00'
  }[article.leaning] || '#999';

  return (
    <Link href={`/articles/${article.id}`}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '16px',
        padding: '16px'
      }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
      >
        {/* Image */}
        {article.image && (
          <div style={{ flex: '0 0 180px', minHeight: '120px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
            <img
              src={article.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', lineHeight: '1.4' }}>
            {article.title}
          </h3>

          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
            {article.excerpt || article.content?.slice(0, 150)}...
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '13px', color: '#999' }}>
            <span style={{
              backgroundColor: leaningColor,
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {article.leaning || 'unknown'}
            </span>
            <span>{article.source_name}</span>
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
