import { verify } from './jwt.js';

function requireToken(req, res, next) {
  const token = req.header('x-agent-token');
  const AGENT_TOKEN = process.env.AGENT_TOKEN || '';

  if (!AGENT_TOKEN || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function isValidSocketToken(token) {
  const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
  return Boolean(AGENT_TOKEN) && token === AGENT_TOKEN;
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
