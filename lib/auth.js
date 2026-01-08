const crypto = require('crypto');

/**
 * Simple in-memory user store (in production, use Supabase)
 * Format: { username: { password_hash, salt, created_at, role } }
 */
let USERS = {
  admin: {
    password_hash: hashPassword('admin123', ''),
    salt: '',
    created_at: new Date().toISOString(),
    role: 'admin'
  }
};

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateUsername(username) {
  return /^[a-z0-9_-]{3,20}$/i.test(username);
}

module.exports = {
  USERS,
  hashPassword,
  verifyPassword,
  generateToken,
  validateUsername
};
