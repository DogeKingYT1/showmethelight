import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light');

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
          <h1>ShowMeTheLight</h1>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/posts">Posts</Link>
            <Link href="/admin">Admin</Link>
            <button onClick={toggleTheme}>
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="site-footer container">
        <small>ShowMeTheLight — Transparency-focused aggregator</small>
      </footer>
    </div>
  );
}
