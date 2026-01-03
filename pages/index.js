import {useEffect, useState} from 'react'
import Link from 'next/link'

export default function Home(){
  const [posts, setPosts] = useState(null)
  useEffect(()=>{fetch('/api/posts').then(r=>r.ok? r.json():[]).then(setPosts).catch(()=>setPosts([]))},[])

  return (
    <div>
      <section id="posts">
        <h2>Latest posts</h2>
        <div id="post-list" className="post-list">
          {!posts && 'Loading...'}
          {posts && posts.length===0 && 'No posts yet.'}
          {posts && posts.map(p=> (
            <article key={p.id} className="post-card">
              <h3><Link href={`/posts/${p.id}`}>{p.title||'Untitled'}</Link></h3>
              <div className="post-meta"><span className="muted">{p.created_at? new Date(p.created_at).toLocaleString():''}</span></div>
              <p>{(p.content||'').slice(0,200)}{(p.content||'').length>200 ? '…' : ''}</p>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1rem'}}>
                <Link href={`/posts/${p.id}`} className="nav-link">Read →</Link>
                <span className="muted">Source: {p.source || 'unknown'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
