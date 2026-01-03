import {useState, useEffect} from 'react'

function getToken(){ if (typeof window==='undefined') return null; return localStorage.getItem('smtl_token') }

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
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(()=>{ if(getToken()) setAuthed(true); fetch('/api/posts').then(r=>r.ok?r.json():[]).then(setPosts).catch(()=>setPosts([])) },[])

  async function doLogin(e){ 
    e.preventDefault(); 
    setError('');
    const pw = e.target.password.value; 
    const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})}); 
    if(res.ok){ 
      const j=await res.json(); 
      localStorage.setItem('smtl_token', j.token); 
      setAuthed(true); 
    } else {
      setError('Login failed. Check your password.');
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
