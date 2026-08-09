// This module provides a starter JWT interface for future auth expansion.
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'agentbridge-secret';

function sign(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

export { sign, verify };
