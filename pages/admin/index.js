import {useState, useEffect} from 'react'

function getToken(){ if (typeof window==='undefined') return null; return localStorage.getItem('smtl_token') }

export default function Admin(){
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState(null);

  useEffect(()=>{ if(getToken()) setAuthed(true); fetch('/api/posts').then(r=>r.ok?r.json():[]).then(setPosts).catch(()=>setPosts([])) },[])

  async function doLogin(e){ e.preventDefault(); const pw = e.target.password.value; const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})}); if(res.ok){ const j=await res.json(); localStorage.setItem('smtl_token', j.token); setAuthed(true); } else alert('Login failed') }

  async function create(e){ e.preventDefault(); if(!getToken()) { alert('not authed'); return } const title=e.target.title.value, content=e.target.content.value, tags=e.target.tags.value.split(',').map(s=>s.trim()).filter(Boolean); const res = await fetch('/api/createPost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},body:JSON.stringify({title,content,tags})}); if(res.ok){ e.target.reset(); const newPosts = await (await fetch('/api/posts')).json(); setPosts(newPosts) } else alert('create failed') }

  async function remove(id){ if(!confirm('Delete?')) return; const res = await fetch('/api/deletePost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},body:JSON.stringify({id})}); if(res.ok){ setPosts((p)=>p.filter(x=>x.id!==id)) } else alert('delete failed') }

  return (
    <>
      {!authed && (
        <section style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2>Admin Login</h2>
          <form onSubmit={doLogin} className="login-form">
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter admin password" />
            </div>
            <button type="submit">Login</button>
          </form>
        </section>
      )}

      {authed && (
        <>
          <section style={{maxWidth: '600px', margin: '0 auto', marginBottom: '3rem'}}>
            <h2>Create Post</h2>
            <form onSubmit={create} className="create-form">
              <div>
                <label htmlFor="title">Title</label>
                <input id="title" name="title" placeholder="Post title" />
              </div>
              <div>
                <label htmlFor="content">Content</label>
                <textarea id="content" name="content" placeholder="Post content..."></textarea>
              </div>
              <div>
                <label htmlFor="tags">Tags (comma separated)</label>
                <input id="tags" name="tags" placeholder="politics, news, analysis" />
              </div>
              <button type="submit">Create Post</button>
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
