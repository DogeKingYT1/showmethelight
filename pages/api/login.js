async function readJson(req){ if (req.body) return req.body; return new Promise((resolve)=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){resolve({})}});}); }

const { USERS, verifyPassword, generateToken } = require('../../lib/auth');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method'});
  try{
    const body = await readJson(req);
    const { username, password } = body;
    if(!username || !password) return res.status(400).json({ error: 'missing_credentials' });
    
    const user = USERS[username];
    if(!user || !verifyPassword(password, user.password_hash, user.salt)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    
    const token = generateToken();
    // Store token mapping (in production, use Redis or Supabase)
    res.status(200).json({ token, username, role: user.role });
  }catch(e){console.error(e); res.status(500).json({ error:'internal' })}
}
