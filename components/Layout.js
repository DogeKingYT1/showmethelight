import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <header className="site-header">
        <div className="container">
          <div style={{display:'flex', alignItems:'center', gap: '1rem', justifyContent: 'space-between', width: '100%'}}>
            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <h1 style={{margin:0}}><Link href="/">ShowMeTheLight</Link></h1>
              <span className="tagline muted" style={{fontSize:'0.9rem', marginLeft:'0.5rem'}}>Transparency-focused aggregator</span>
            </div>
            <nav aria-label="Main navigation">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/posts" className="nav-link">Posts</Link>
              <Link href="/admin" className="nav-link">Admin</Link>
              <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--accent)', fontSize: '1rem', padding: '0.35rem 0.6rem', borderRadius: '8px', marginLeft: '0.5rem' }}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container">
        {router.pathname === '/' && <div className="hero inner"><h2>Compare framing. Read sources without editorializing.</h2><p className="muted">A lightweight feed focused on transparency — quick excerpts, original links, and clear dates.</p></div>}
        {children}
      </main>
      <footer className="site-footer container">
        <small>© {new Date().getFullYear()} ShowMeTheLight — Built for clarity</small>
      </footer>
    </div>
  );
}
