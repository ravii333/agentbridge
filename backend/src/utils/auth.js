import { timingSafeEqual } from 'node:crypto';
import { verify } from './jwt.js';

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  // timingSafeEqual throws on length mismatch, so pad both to the same
  // length first - a constant-time equality check is pointless if the
  // length comparison it's guarding against leaks timing on its own.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function requireToken(req, res, next) {
  const token = req.header('x-agent-token');
  const AGENT_TOKEN = process.env.AGENT_TOKEN || '';

  if (!AGENT_TOKEN || !safeEqual(token, AGENT_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function isValidSocketToken(token) {
  const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
  return Boolean(AGENT_TOKEN) && safeEqual(token, AGENT_TOKEN);
}

function requireUser(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = verify(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export { requireToken, isValidSocketToken, requireUser };
