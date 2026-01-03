import Link from 'next/link'

export default function Posts({posts}){
  return (
      <main className="container">
        <h2>All posts</h2>
        <div className="post-list">
          {(!posts||posts.length===0) && <div>No posts.</div>}
          {posts && posts.map(p=> (
            <div key={p.id} className="post-card"><h3><Link href={`/posts/${p.id}`}>{p.title}</Link></h3><p>{(p.content||'').slice(0,300)}</p></div>
          ))}
        </div>
      </main>
  )
}

export async function getServerSideProps(){
  try{
    const res = await fetch(process.env.SUPABASE_URL + '/rest/v1/posts?select=*&order=created_at.desc', { headers: { apikey: process.env.SUPABASE_KEY, Authorization: `Bearer ${process.env.SUPABASE_KEY}` } })
    const posts = await res.json();
    return { props: { posts } }
  }catch(e){ return { props: { posts: [] } } }
}
