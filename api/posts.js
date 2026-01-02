const { URL } = require('url');

async function getBody(req){
	if (req.body) return req.body;
	return new Promise((resolve, reject) => {
		let data = '';
		req.on('data', chunk => data += chunk);
		req.on('end', () => {
			try{ resolve(JSON.parse(data || '{}')) }catch(e){ resolve({}) }
		});
		req.on('error', reject);
	});
}

module.exports = async (req, res) => {
	try {
		const supabaseUrl = process.env.SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_KEY;
		if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_KEY' });

		const url = new URL(req.url, 'http://localhost');
		const idParam = url.searchParams.get('id');

		let endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/posts?select=*`;
		if (idParam) endpoint += `&id=${encodeURIComponent(idParam)}`;
		endpoint += '&order=created_at.desc';

		const fetchRes = await fetch(endpoint, {
			headers: {
				apikey: supabaseKey,
				Authorization: `Bearer ${supabaseKey}`,
			},
		});
		const data = await fetchRes.json();
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	} catch (err) {
		console.error(err);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: 'internal_error' }));
	}
};
