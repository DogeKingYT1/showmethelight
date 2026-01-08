async function readJson(req){ if (req.body) return req.body; return new Promise((resolve)=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){resolve({})}});}); }

const { USERS, hashPassword, generateToken, validateUsername } = require('../../lib/auth');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method'});
  try{
    const body = await readJson(req);
    const { username, password } = body;
    
    if(!username || !password) return res.status(400).json({ error: 'missing_credentials' });
    if(!validateUsername(username)) return res.status(400).json({ error: 'invalid_username' });
    if(password.length < 8) return res.status(400).json({ error: 'password_too_short' });
    if(USERS[username]) return res.status(409).json({ error: 'user_exists' });
    
    const { hash, salt } = hashPassword(password);
    USERS[username] = {
      password_hash: hash,
      salt,
      created_at: new Date().toISOString(),
      role: 'user'
    };
    
    const token = generateToken();
    res.status(201).json({ token, username, role: 'user', message: 'User created' });
  }catch(e){console.error(e); res.status(500).json({ error:'internal' })}
}
