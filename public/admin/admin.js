function getToken(){return localStorage.getItem('smtl_token')}

async function login(e){
	e.preventDefault();
	const pw = document.getElementById('password').value;
	try{
		const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
		if(!res.ok) throw new Error('login failed');
		const json = await res.json();
		localStorage.setItem('smtl_token', json.token);
		showAdminArea();
	}catch(err){alert('Login failed');console.error(err)}
}

function showAdminArea(){
	document.getElementById('admin-area').style.display='block';
	document.getElementById('login').style.display='none';
	fetchPosts();
}

async function fetchPosts(){
	const list = document.getElementById('admin-post-list');
	list.textContent = 'Loading...';
	try{
		const res = await fetch('/api/posts');
		if(!res.ok) throw new Error('failed');
		const posts = await res.json();
		list.innerHTML = '';
		posts.forEach(p=>{
			const div = document.createElement('div');
			div.className='post-card';
			const btn = document.createElement('button');
			btn.textContent='Delete';
			btn.style.float='right';
			btn.addEventListener('click', ()=> deletePost(p.id));
			div.innerHTML = `<h3>${escapeHtml(p.title)}</h3><p class="muted">${p.created_at||''}</p><p>${escapeHtml((p.content||'').slice(0,300))}</p>`;
			div.appendChild(btn);
			list.appendChild(div);
		})
	}catch(err){list.textContent='Unable to load posts';console.error(err)}
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function createPost(e){
	e.preventDefault();
	const token = getToken();
	if(!token){alert('Not authenticated');return}
	const title = document.getElementById('title').value.trim();
	const content = document.getElementById('content').value.trim();
	const tags = (document.getElementById('tags').value||'').split(',').map(s=>s.trim()).filter(Boolean);
	try{
		const res = await fetch('/api/createPost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({title,content,tags})});
		if(!res.ok) throw new Error('create failed');
		document.getElementById('create').reset();
		fetchPosts();
	}catch(err){alert('Unable to create post');console.error(err)}
}

async function deletePost(id){
	if(!confirm('Delete this post?')) return;
	const token = getToken();
	try{
		const res = await fetch('/api/deletePost',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({id})});
		if(!res.ok) throw new Error('delete failed');
		fetchPosts();
	}catch(err){alert('Unable to delete');console.error(err)}
}

document.getElementById('login').addEventListener('submit', login);
document.getElementById('create').addEventListener('submit', createPost);

if(getToken()) showAdminArea();

