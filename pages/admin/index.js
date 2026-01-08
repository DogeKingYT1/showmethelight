import {useState, useEffect} from 'react'

function getToken(){ if (typeof window==='undefined') return null; return localStorage.getItem('smtl_token') }
function getUsername(){ if (typeof window==='undefined') return null; return localStorage.getItem('smtl_user') }

const POLITICAL_LEANINGS = [
  { value: 'far-left', label: 'Far Left' },
  { value: 'left', label: 'Left-leaning' },
  { value: 'center-left', label: 'Center-left' },
  { value: 'center', label: 'Center' },
  { value: 'center-right', label: 'Center-right' },
  { value: 'right', label: 'Right-leaning' },
  { value: 'far-right', label: 'Far Right' },
];

export default function Admin(){
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [posts, setPosts] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'posts', 'users'

  useEffect(()=>{ 
    const token = getToken();
    const user = getUsername();
    if(token && user) { 
      setAuthed(true);
      setUsername(user);
      fetchPosts();
    }
  },[])

  async function fetchPosts() {
    try {
      const r = await fetch('/api/posts');
      const data = await r.ok ? await r.json() : [];
      setPosts(data);
    } catch(e) { setPosts([]); }
  }

  async function fetchUsers() {
    try {
      const token = getToken();
      const r = await fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await r.ok ? await r.json() : { users: [] };
      setUsers(data.users);
    } catch(e) { setUsers([]); }
  }

  async function doLogin(e){ 
    e.preventDefault(); 
    setError('');
    const user = e.target.username.value; 
    const pw = e.target.password.value; 
    const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username: user, password: pw})}); 
    if(res.ok){ 
      const j=await res.json(); 
      localStorage.setItem('smtl_token', j.token);
      localStorage.setItem('smtl_user', j.username);
      setUsername(j.username);
      setAuthed(true); 
      fetchPosts();
    } else {
      setError('Login failed. Check your username and password.');
    }
  }

  async function doSignup(e){ 
    e.preventDefault(); 
    setError('');
    const user = e.target.signup_username.value; 
    const pw = e.target.signup_password.value;
    const pwConfirm = e.target.signup_password_confirm.value;
    
    if(pw !== pwConfirm) {
      setError('Passwords do not match');
      return;
    }
    
    const res = await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username: user, password: pw})}); 
    const j = await res.json();
    if(res.ok){ 
      localStorage.setItem('smtl_token', j.token);
      localStorage.setItem('smtl_user', j.username);
      setUsername(j.username);
      setAuthed(true); 
      setShowSignup(false);
      fetchPosts();
    } else {
      setError('Signup failed: ' + (j.error || 'Unknown error'));
    }
  }

  async function create(e){ 
    e.preventDefault(); 
    setError('');
    if(!getToken()) { 
      setError('Not authenticated'); 
      return; 
    } 
    
    setLoading(true);
    const title = e.target.title.value; 
    const content = e.target.content.value; 
    const leaning = e.target.leaning.value;
    const source = e.target.source.value;
    
    if(!title.trim() || !content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }
    
    const tags = [leaning, source].filter(Boolean);
    
    try {
      const res = await fetch('/api/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({title, content, tags})
      }); 
      
      if(res.ok){ 
        e.target.reset(); 
        await fetchPosts();
        setError('Post created successfully');
      } else {
        const errData = await res.json();
        setError('Failed to create post: ' + (errData.error || 'Unknown error'));
      }
    } catch(err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createAnnouncement(e){
    e.preventDefault();
    setError('');
    if(!getToken()) { setError('Not authenticated'); return; }
    setLoading(true);
    const title = e.target.ann_title.value;
    const content = e.target.ann_content.value;
    if(!title.trim() || !content.trim()){ setError('Title and content required'); setLoading(false); return; }
    try{
      const res = await fetch('/api/createPost', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() },
        body: JSON.stringify({ title, content, tags: ['announcement'] })
      });
      if(!res.ok){ const jd = await res.json().catch(()=>({})); throw new Error(jd.error||'post failed'); }
      e.target.reset();
      await fetchPosts();
      setError('Announcement posted');
    }catch(err){ setError('Error: '+err.message); }
    finally{ setLoading(false); }
  }

  async function remove(id){ 
    if(!confirm('Delete this post?')) return; 
    try {
      const res = await fetch('/api/deletePost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},body:JSON.stringify({id})}); 
      if(res.ok){ 
        await fetchPosts();
      } else {
        alert('Delete failed');
      }
    } catch(err) {
      alert('Error deleting: ' + err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('smtl_token');
    localStorage.removeItem('smtl_user');
    setAuthed(false);
    setUsername('');
    setPosts(null);
    setUsers(null);
    setError('');
  }

  return (
    <>
      {!authed && (
        <section style={{maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
          <h2>{showSignup ? 'Create Account' : 'Admin Login'}</h2>
          {error && <div style={{background: '#f44336', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}
          
          {!showSignup ? (
            <form onSubmit={doLogin}>
              <div style={{marginBottom: '12px'}}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" placeholder="admin" required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <div style={{marginBottom: '12px'}}>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Enter password" required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <button type="submit" style={{padding: '8px 16px'}}>Login</button>
              <button type="button" onClick={()=>setShowSignup(true)} style={{padding: '8px 16px', marginLeft: '8px', background: '#e0e0e0', color: '#000'}}>Create Account</button>
            </form>
          ) : (
            <form onSubmit={doSignup}>
              <div style={{marginBottom: '12px'}}>
                <label htmlFor="signup_username">Username (3-20 chars, alphanumeric + - _)</label>
                <input id="signup_username" name="signup_username" placeholder="newuser" required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <div style={{marginBottom: '12px'}}>
                <label htmlFor="signup_password">Password (min 8 chars)</label>
                <input id="signup_password" name="signup_password" type="password" required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <div style={{marginBottom: '12px'}}>
                <label htmlFor="signup_password_confirm">Confirm Password</label>
                <input id="signup_password_confirm" name="signup_password_confirm" type="password" required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <button type="submit" style={{padding: '8px 16px'}}>Sign Up</button>
              <button type="button" onClick={()=>setShowSignup(false)} style={{padding: '8px 16px', marginLeft: '8px', background: '#e0e0e0', color: '#000'}}>Back to Login</button>
            </form>
          )}
        </section>
      )}

      {authed && (
        <>
          <section style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2>Admin Panel</h2>
              <div>
                <span style={{marginRight: '16px'}}>Logged in as: <strong>{username}</strong></span>
                <button onClick={handleLogout} style={{padding: '6px 12px'}}>Logout</button>
              </div>
            </div>

            {error && <div style={{background: '#f44336', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}

            <div style={{display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #ddd'}}>
              <button onClick={()=>setActiveTab('create')} style={{padding: '12px 16px', borderBottom: activeTab === 'create' ? '3px solid blue' : 'none', background: 'none', cursor: 'pointer'}}>Create Post</button>
              <button onClick={()=>{setActiveTab('posts'); fetchPosts();}} style={{padding: '12px 16px', borderBottom: activeTab === 'posts' ? '3px solid blue' : 'none', background: 'none', cursor: 'pointer'}}>Posts</button>
              <button onClick={()=>{setActiveTab('users'); fetchUsers();}} style={{padding: '12px 16px', borderBottom: activeTab === 'users' ? '3px solid blue' : 'none', background: 'none', cursor: 'pointer'}}>Users</button>
            </div>

            {activeTab === 'create' && (
              <section>
                <div style={{marginBottom: '2rem', padding: '12px', border: '1px dashed #ccc', borderRadius: 8}}>
                  <h3 style={{marginTop: 0}}>Quick Announcement</h3>
                  <form onSubmit={createAnnouncement}>
                    <div style={{marginBottom: '12px'}}>
                      <label htmlFor="ann_title">Title *</label>
                      <input id="ann_title" name="ann_title" placeholder="Announcement title" required style={{width: '100%', padding: 8}} />
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label htmlFor="ann_content">Content *</label>
                      <textarea id="ann_content" name="ann_content" rows={4} placeholder="Announcement content..." style={{width: '100%', padding: 8}} />
                    </div>
                    <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Announcement'}</button>
                  </form>
                </div>

                <h3>Full Post</h3>
                <form onSubmit={create} className="create-form">
                  <div style={{marginBottom: '12px'}}>
                    <label htmlFor="title">Title *</label>
                    <input id="title" name="title" placeholder="Post title" required style={{width: '100%', padding: 8}} />
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <label htmlFor="content">Content *</label>
                    <textarea id="content" name="content" placeholder="Post content..." style={{width: '100%', padding: 8, height: '150px'}}></textarea>
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <label htmlFor="leaning">Media Source Political Leaning</label>
                    <select id="leaning" name="leaning" style={{width: '100%', padding: 8}}>
                      <option value="">Select leaning (optional)</option>
                      {POLITICAL_LEANINGS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <label htmlFor="source">Source Name</label>
                    <input id="source" name="source" placeholder="e.g., CNN, Fox News, AP" style={{width: '100%', padding: 8}} />
                  </div>
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Post'}</button>
                </form>
              </section>
            )}

            {activeTab === 'posts' && (
              <section>
                <h3>Existing Posts</h3>
                <div>
                  {!posts && <p>Loading...</p>}
                  {posts && posts.length === 0 && <p style={{color: '#999'}}>No posts yet.</p>}
                  {posts && posts.map(p=> (
                    <div key={p.id} style={{display: 'flex', flexDirection: 'column', marginBottom: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: 8}}>
                      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'}}>
                        <h4 style={{margin: '0 0 4px 0'}}>{p.title}</h4>
                        <button onClick={()=>remove(p.id)} style={{padding: '4px 8px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer'}}>Delete</button>
                      </div>
                      <p style={{margin: '4px 0', fontSize: '0.85rem', color: '#666'}}>{new Date(p.created_at).toLocaleString()}</p>
                      {p.tags && p.tags.length > 0 && (
                        <div style={{marginBottom: '8px'}}>
                          {p.tags.map((tag, i) => (
                            <span key={i} style={{display: 'inline-block', background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', marginRight: '4px', borderRadius: 4, fontSize: '0.85rem'}}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <p style={{margin: 0, color: '#333'}}>{(p.content||'').slice(0,300)}{(p.content||'').length > 300 ? '…' : ''}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'users' && (
              <section>
                <h3>Users</h3>
                <div>
                  {!users && <p><button onClick={fetchUsers}>Load Users</button></p>}
                  {users && users.length === 0 && <p style={{color: '#999'}}>No users yet.</p>}
                  {users && (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{borderBottom: '2px solid #ddd'}}>
                          <th style={{textAlign: 'left', padding: '12px'}}>Username</th>
                          <th style={{textAlign: 'left', padding: '12px'}}>Role</th>
                          <th style={{textAlign: 'left', padding: '12px'}}>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.username} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '12px'}}>{u.username}</td>
                            <td style={{padding: '12px'}}><span style={{background: u.role === 'admin' ? '#f44336' : '#4caf50', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem'}}>{u.role}</span></td>
                            <td style={{padding: '12px', fontSize: '0.85rem'}}>{new Date(u.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}
          </section>
        </>
      )}
    </>
  )
}

  async function create(e){ 
    e.preventDefault(); 
    setError('');
    if(!getToken()) { 
      setError('Not authenticated'); 
      return; 
    } 
    
    setLoading(true);
    const title = e.target.title.value; 
    const content = e.target.content.value; 
    const leaning = e.target.leaning.value;
    const source = e.target.source.value;
    
    if(!title.trim() || !content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }
    
    const tags = [leaning, source].filter(Boolean);
    
    try {
      const res = await fetch('/api/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({title, content, tags})
      }); 
      
      if(res.ok){ 
        e.target.reset(); 
        const newPosts = await (await fetch('/api/posts')).json(); 
        setPosts(newPosts);
        setError('');
      } else {
        const errData = await res.json();
        setError('Failed to create post: ' + (errData.error || 'Unknown error'));
      }
    } catch(err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createAnnouncement(e){
    e.preventDefault();
    setError('');
    if(!getToken()) { setError('Not authenticated'); return; }
    setLoading(true);
    const title = e.target.ann_title.value;
    const content = e.target.ann_content.value;
    if(!title.trim() || !content.trim()){ setError('Title and content required'); setLoading(false); return; }
    try{
      const res = await fetch('/api/createPost', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() },
        body: JSON.stringify({ title, content, tags: ['announcement'] })
      });
      if(!res.ok){ const jd = await res.json().catch(()=>({})); throw new Error(jd.error||'post failed'); }
      e.target.reset();
      const newPosts = await (await fetch('/api/posts')).json();
      setPosts(newPosts);
      setError('Announcement posted');
    }catch(err){ setError('Error: '+err.message); }
    finally{ setLoading(false); }
  }

  async function remove(id){ 
    if(!confirm('Delete this post?')) return; 
    try {
      const res = await fetch('/api/deletePost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},body:JSON.stringify({id})}); 
      if(res.ok){ 
        setPosts((p)=>p.filter(x=>x.id!==id)) 
      } else {
        alert('Delete failed');
      }
    } catch(err) {
      alert('Error deleting: ' + err.message);
    }
  }

  return (
    <>
      {!authed && (
        <section style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2>Admin Login</h2>
          {error && <div style={{background: 'var(--red)', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}
          <form onSubmit={doLogin} className="login-form">
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter admin password" required />
            </div>
            <button type="submit">Login</button>
          </form>
        </section>
      )}

      {authed && (
        <>
          <section style={{maxWidth: '600px', margin: '0 auto', marginBottom: '3rem'}}>
            <h2>Create Post</h2>
            <div style={{marginBottom: '1.5rem', padding: '12px', border: '1px dashed #ccc', borderRadius: 8}}>
              <h3 style={{marginTop: 0}}>Quick Announcement</h3>
              <form onSubmit={createAnnouncement}>
                <div>
                  <label htmlFor="ann_title">Title *</label>
                  <input id="ann_title" name="ann_title" placeholder="Announcement title" required style={{width: '100%', padding: 8, marginBottom: 8}} />
                </div>
                <div>
                  <label htmlFor="ann_content">Content *</label>
                  <textarea id="ann_content" name="ann_content" rows={4} placeholder="Announcement content..." style={{width: '100%', padding: 8, marginBottom: 8}} />
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Announcement'}</button>
              </form>
            </div>
            {error && <div style={{background: 'var(--red)', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}
            <form onSubmit={create} className="create-form">
              <div>
                <label htmlFor="title">Title *</label>
                <input id="title" name="title" placeholder="Post title" required />
              </div>
              <div>
                <label htmlFor="content">Content *</label>
                <textarea id="content" name="content" placeholder="Post content..."></textarea>
              </div>
              <div>
                <label htmlFor="leaning">Media Source Political Leaning</label>
                <select id="leaning" name="leaning">
                  <option value="">Select leaning (optional)</option>
                  {POLITICAL_LEANINGS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="source">Source Name</label>
                <input id="source" name="source" placeholder="e.g., CNN, Fox News, AP" />
              </div>
              <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Post'}</button>
            </form>
          </section>

          <section style={{maxWidth: '1100px', margin: '0 auto'}}>
            <h2>Existing Posts</h2>
            <div className="post-list">
              {!posts && <p>Loading...</p>}
              {posts && posts.length === 0 && <p className="muted">No posts yet.</p>}
              {posts && posts.map(p=> (
                <div key={p.id} className="post-card" style={{display: 'flex', flexDirection: 'column'}}>
                  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'}}>
                    <h3 style={{margin: '0 0 0.5rem 0'}}>{p.title}</h3>
                    <button className="btn-delete" onClick={()=>remove(p.id)}>Delete</button>
                  </div>
                  <p className="muted" style={{margin: '0 0 0.75rem 0', fontSize: '0.85rem'}}>{new Date(p.created_at).toLocaleString()}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="tags" style={{marginBottom: '0.75rem'}}>
                      {p.tags.map((tag, i) => (
                        <span key={i} className="tag tag-blue">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p style={{margin: 0, color: 'var(--accent)'}}>{(p.content||'').slice(0,300)}{(p.content||'').length > 300 ? '…' : ''}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}
