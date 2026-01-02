async function readJson(req){
	if (req.body) return req.body;
	return new Promise((resolve,reject)=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){resolve({})}}); req.on('error',reject)});
}

module.exports = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
	try{
		const body = await readJson(req);
		const { password } = body;
		if (!password) return res.status(400).json({ error: 'missing_password' });
		if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'unauthorized' });
		const token = process.env.ADMIN_TOKEN || 'changeme';
		res.setHeader('Content-Type','application/json');
		res.end(JSON.stringify({ token }));
	}catch(err){console.error(err); res.statusCode=500; res.end(JSON.stringify({ error:'internal_error' }))}
};
