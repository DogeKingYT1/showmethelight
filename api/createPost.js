const { URL } = require('url');

async function readJson(req){
	if (req.body) return req.body;
	return new Promise((resolve,reject)=>{
		let d=''; req.on('data',c=>d+=c); req.on('end',()=>{ try{resolve(JSON.parse(d||'{}'))}catch(e){resolve({})} }); req.on('error',reject);
	});
}

module.exports = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
	try {
		const auth = (req.headers.authorization || '');
		const token = auth.replace(/^Bearer\s+/i, '');
		if (!token || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });

		const body = await readJson(req);
		const { title, content, tags } = body;
		if (!title || !content) return res.status(400).json({ error: 'invalid_payload' });

		const supabaseUrl = process.env.SUPABASE_URL;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
		if (!supabaseUrl || !supabaseServiceKey) return res.status(500).json({ error: 'missing_supabase_config' });

		const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/posts`;
		const fetchRes = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				apikey: supabaseServiceKey,
				Authorization: `Bearer ${supabaseServiceKey}`,
				Prefer: 'return=representation'
			},
			body: JSON.stringify({ title, content, tags: tags || [], created_at: new Date().toISOString() })
		});
		const data = await fetchRes.json();
		res.setHeader('Content-Type','application/json');
		res.end(JSON.stringify(data));
	} catch (err) {
		console.error(err);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: 'internal_error' }));
	}
};
