import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TabContent = {
  ANNOUNCEMENTS: 'announcements',
  ARTICLES: 'articles',
  USERS: 'users',
  SOURCES: 'sources'
};

export default function AdminPanel() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState(TabContent.ANNOUNCEMENTS);
  const [loading, setLoading] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  // Articles state
  const [articles, setArticles] = useState([]);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleLink, setArticleLink] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleLeaning, setArticleLeaning] = useState('center');

  // Users state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // Sources state
  const [sources, setSources] = useState([]);
  const [sourceName, setSourceName] = useState('');
  const [sourceFeedUrl, setSourceFeedUrl] = useState('');
  const [sourceLeaning, setSourceLeaning] = useState('center');
  const [sourceDescription, setSourceDescription] = useState('');

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      loadData();
    }
  }, []);

  // Load all data when token changes
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadAnnouncements(),
        loadArticles(),
        loadUsers(),
        loadSources()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await fetch('/api/articles?tag=announcement');
      const data = await res.json();
      setAnnouncements(data.filter(a => a.tag === 'announcement') || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
    }
  };

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data.filter(a => a.tag !== 'announcement') || []);
    } catch (err) {
      console.error('Error loading articles:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data || []);
    } catch (err) {
      console.error('Error loading sources:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', username);
        setPassword('');
        loadData();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setLoginError('');
        setShowSignup(false);
        // Auto-login after signup
        handleLogin(e);
      } else {
        setLoginError(data.error || 'Signup failed');
      }
    } catch (err) {
      setLoginError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent) {
      alert('Title and content required');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          leaning: 'announcement',
          tag: 'announcement'
        })
      });

      if (res.ok) {
        setAnnouncementTitle('');
        setAnnouncementContent('');
        loadAnnouncements();
        alert('Announcement posted');
      } else {
        alert('Failed to post announcement');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePostArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleLink) {
      alert('Title and link required');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          link: articleLink,
          content: articleContent,
          leaning: articleLeaning
        })
      });

      if (res.ok) {
        setArticleTitle('');
        setArticleLink('');
        setArticleContent('');
        setArticleLeaning('center');
        loadArticles();
        alert('Article posted');
      } else {
        alert('Failed to post article');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!sourceName || !sourceFeedUrl) {
      alert('Name and feed URL required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sources')
        .insert([
          {
            name: sourceName,
            feed_url: sourceFeedUrl,
            leaning: sourceLeaning,
            description: sourceDescription,
            active: true
          }
        ]);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setSourceName('');
        setSourceFeedUrl('');
        setSourceLeaning('center');
        setSourceDescription('');
        loadSources();
        alert('Source added');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (!confirm('Delete this source?')) return;

    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        loadSources();
        alert('Source deleted');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleSourceActive = async (sourceId, currentActive) => {
    try {
      const { error } = await supabase
        .from('sources')
        .update({ active: !currentActive })
        .eq('id', sourceId);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        loadSources();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch('/api/articles/' + id, { method: 'DELETE' });
      if (res.ok) {
        loadAnnouncements();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      const res = await fetch('/api/articles/' + id, { method: 'DELETE' });
      if (res.ok) {
        loadArticles();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ marginBottom: '30px' }}>Admin Panel</h1>

        <form onSubmit={showSignup ? handleSignup : handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>

          {loginError && <p style={{ color: 'red', marginBottom: '15px' }}>{loginError}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Loading...' : (showSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {showSignup ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setShowSignup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              New user?{' '}
              <button
                onClick={() => setShowSignup(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Panel</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        {Object.values(TabContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === tab ? '#333' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '4px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Announcements Tab */}
      {activeTab === TabContent.ANNOUNCEMENTS && (
        <div>
          <h2>Create Announcement</h2>
          <form onSubmit={handlePostAnnouncement} style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="Announcement title"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content</label>
              <textarea
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', minHeight: '150px', fontFamily: 'inherit' }}
                placeholder="Announcement content"
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Post Announcement
            </button>
          </form>

          <h2>Recent Announcements</h2>
          {announcements.length === 0 ? (
            <p style={{ color: '#999' }}>No announcements yet</p>
          ) : (
            <div>
              {announcements.map((ann) => (
                <div key={ann.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{ann.title}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{ann.content}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <small style={{ color: '#999' }}>
                      {new Date(ann.created_at).toLocaleDateString()}
                    </small>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e74c3c',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === TabContent.ARTICLES && (
        <div>
          <h2>Post Article</h2>
          <form onSubmit={handlePostArticle} style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="Article title"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Link</label>
              <input
                type="url"
                value={articleLink}
                onChange={(e) => setArticleLink(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="https://example.com/article"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Leaning</label>
              <select
                value={articleLeaning}
                onChange={(e) => setArticleLeaning(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="independent">Independent</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content (Optional)</label>
              <textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', minHeight: '150px', fontFamily: 'inherit' }}
                placeholder="Article content"
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Post Article
            </button>
          </form>

          <h2>Existing Articles</h2>
          {articles.length === 0 ? (
            <p style={{ color: '#999' }}>No articles yet</p>
          ) : (
            <div>
              {articles.slice(0, 10).map((art) => (
                <div key={art.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{art.title}</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', textTransform: 'capitalize' }}>
                      {art.leaning}
                    </span>
                    <small style={{ color: '#999' }}>
                      {new Date(art.created_at).toLocaleDateString()}
                    </small>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e74c3c',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {articles.length > 10 && <p style={{ color: '#999' }}>Showing 10 of {articles.length} articles</p>}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === TabContent.USERS && (
        <div>
          <h2>Users</h2>
          {users.length === 0 ? (
            <p style={{ color: '#999' }}>No users found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Username</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Admin</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{user.username}</td>
                      <td style={{ padding: '10px' }}>{user.email || '-'}</td>
                      <td style={{ padding: '10px' }}>{user.is_admin ? '✓' : '-'}</td>
                      <td style={{ padding: '10px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', position: 'relative' }}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          ⋮
                        </button>
                        {menuOpen === user.id && (
                          <div style={{
                            position: 'absolute',
                            right: '0',
                            top: '100%',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            minWidth: '150px'
                          }}>
                            <button
                              onClick={() => {
                                alert('User details: ' + JSON.stringify(user, null, 2));
                                setMenuOpen(null);
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                alert('Toggle admin for ' + user.username);
                                setMenuOpen(null);
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === TabContent.SOURCES && (
        <div>
          <h2>Add News Source</h2>
          <form onSubmit={handleAddSource} style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Source Name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="e.g., CNN, BBC News"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>RSS Feed URL</label>
              <input
                type="url"
                value={sourceFeedUrl}
                onChange={(e) => setSourceFeedUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="https://example.com/rss"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Political Leaning</label>
              <select
                value={sourceLeaning}
                onChange={(e) => setSourceLeaning(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="independent">Independent</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description (Optional)</label>
              <input
                type="text"
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                placeholder="e.g., Progressive news outlet"
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add Source
            </button>
          </form>

          <h2>Existing Sources ({sources.length})</h2>
          {sources.length === 0 ? (
            <p style={{ color: '#999' }}>No sources yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {sources.map((source) => (
                <div key={source.id} style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '15px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{source.name}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', wordBreak: 'break-all' }}>
                      {source.feed_url}
                    </p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                      Leaning: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{source.leaning}</span>
                      {source.description && ` · ${source.description}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleToggleSourceActive(source.id, source.active)}
                      style={{
                        padding: '8px 12px',
                        background: source.active ? '#27ae60' : '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {source.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      style={{
                        padding: '8px 12px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
