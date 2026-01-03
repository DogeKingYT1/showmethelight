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
          <h1><Link href="/">ShowMeTheLight</Link></h1>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/posts">Posts</Link>
            <Link href="/admin">Admin</Link>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '1.5rem' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>
      <main className="container">
        {router.pathname === '/' && <p className="tagline">Compare framing — read sources without editorializing.</p>}
        {children}
      </main>
      <footer className="site-footer container">
        <small>ShowMeTheLight — Transparency-focused aggregator</small>
      </footer>
    </div>
  );
}
