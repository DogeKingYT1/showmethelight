async function load() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('content');
  try {
    if (id) {
      const res = await fetch(`/api/posts?id=eq.${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Failed to fetch post');
      const posts = await res.json();
      const p = posts[0];
      if (!p) { container.textContent = 'Post not found.'; return; }
      container.innerHTML = `<article class="post-card"><h2>${escapeHtml(p.title)}</h2><div class="post-meta"><span class="muted">${p.created_at ? new Date(p.created_at).toLocaleString() : ''}</span></div><div class="post-body"></div></article>`;
      container.querySelector('.post-body').textContent = p.content;
    } else {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const posts = await res.json();
      container.innerHTML = '<h2>All posts</h2><div id="post-list" class="post-list"></div>';
      posts.forEach(p => {
        const div = document.createElement('div');
        div.className = 'post-card';
        div.innerHTML = `<h3><a href="?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3><p>${escapeHtml(p.content.slice(0,300))}</p>`;
        container.querySelector('#post-list').appendChild(div);
      });
    }
  } catch (err) {
    container.textContent = 'Unable to load content.';
    console.error(err);
  }
}

function escapeHtml(s){
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.addEventListener('DOMContentLoaded', load);
