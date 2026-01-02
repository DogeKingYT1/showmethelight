async function fetchPosts() {
	try {
		const res = await fetch('/api/posts');
		if (!res.ok) throw new Error('Failed to fetch');
		const posts = await res.json();
		renderPosts(posts);
	} catch (err) {
		const list = document.getElementById('post-list');
		if (list) list.textContent = 'Unable to load posts.';
		console.error(err);
	}
}

function excerpt(text, n = 200) {
	if (!text) return '';
	return text.length > n ? text.slice(0, n).trim() + '…' : text;
}

function renderPosts(posts) {
	const container = document.getElementById('post-list');
	if (!container) return;
	container.innerHTML = '';
	if (!posts || posts.length === 0) {
		container.textContent = 'No posts yet.';
		return;
	}
	posts.forEach(p => {
		const card = document.createElement('article');
		card.className = 'post-card';

		const h3 = document.createElement('h3');
		const link = document.createElement('a');
		link.href = `/public/posts/posts.html?id=${encodeURIComponent(p.id)}`;
		link.textContent = p.title || 'Untitled';
		h3.appendChild(link);

		const meta = document.createElement('div');
		meta.className = 'post-meta';
		const date = document.createElement('span');
		date.className = 'muted';
		date.textContent = p.created_at ? new Date(p.created_at).toLocaleString() : '';
		const tagsWrap = document.createElement('div');
		tagsWrap.className = 'tags';
		(p.tags || []).forEach(t => {
			const tg = document.createElement('span');
			tg.className = 'tag tag-' + (t === 'red' ? 'red' : t === 'blue' ? 'blue' : 'neutral');
			tg.textContent = t;
			tagsWrap.appendChild(tg);
		});

		const excerptP = document.createElement('p');
		excerptP.textContent = excerpt(p.content || '');

		meta.appendChild(date);
		meta.appendChild(tagsWrap);

		card.appendChild(h3);
		card.appendChild(meta);
		card.appendChild(excerptP);
		container.appendChild(card);
	});
}

window.addEventListener('DOMContentLoaded', fetchPosts);
