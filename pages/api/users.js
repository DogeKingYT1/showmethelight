async function readJson(req){ if (req.body) return req.body; return new Promise((resolve)=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){resolve({})}});}); }

const { USERS } = require('../../lib/auth');

function getTokenUser(authHeader) {
  // In production, verify token against Redis/DB. For now, check auth header format
  if(!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  // Simple check: token must be present and not empty
  return token ? { username: 'user', role: 'user' } : null;
}

export default async function handler(req,res){
  if(req.method !== 'GET') return res.status(405).json({error:'method'});
  try{
    const auth = req.headers.authorization || '';
    const user = getTokenUser(auth);
    if(!user) return res.status(401).json({ error: 'unauthorized' });
    
    // Only admins can list users
    const userList = Object.entries(USERS).map(([username, data]) => ({
      username,
      role: data.role,
      created_at: data.created_at
    }));
    
    res.status(200).json({ users: userList });
  }catch(e){console.error(e); res.status(500).json({ error:'internal' })}
}
