import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'

export default function Post(){
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null)
  useEffect(()=>{ if(!id) return; fetch(`/api/posts?id=eq.${encodeURIComponent(id)}`).then(r=>r.ok? r.json():[]).then(arr=>setPost(arr[0]||null)).catch(()=>setPost(null)) },[id])
  if (!id) return <div className="container">No post selected.</div>
  return (
    <>
      {!post && 'Loading...'}
      {post && (
        <article className="post-card">
          <h2>{post.title}</h2>
          <div className="post-meta"><span className="muted">{post.created_at? new Date(post.created_at).toLocaleString():''}</span></div>
          <div style={{whiteSpace:'pre-wrap'}}>{post.content}</div>
        </article>
      )}
    </>
  )
}
