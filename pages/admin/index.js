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
      <main className="container">
        {!authed && (
          <section>
            <h2>Login</h2>
            <form onSubmit={doLogin} className="login-form"><label>Password</label><input name="password" type="password" /><button>Login</button></form>
          </section>
        )}

        {authed && (
          <section>
            <h2>Create post</h2>
            <form onSubmit={create} className="create-form">
              <label>Title</label><input name="title" />
              <label>Content</label><textarea name="content" rows={6}></textarea>
              <label>Tags (comma separated)</label><input name="tags" />
              <button>Create</button>
            </form>
            <h3 style={{marginTop:18}}>Existing posts</h3>
            <div className="post-list">{!posts && 'Loading...'}{posts && posts.map(p=> <div key={p.id} className="post-card"><h3>{p.title} <button onClick={()=>remove(p.id)} style={{float:'right'}}>Delete</button></h3><p className="muted">{p.created_at}</p><p>{(p.content||'').slice(0,300)}</p></div>)}</div>
          </section>
        )}
      </main>
  )
}
