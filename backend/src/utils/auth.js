const AGENT_TOKEN = process.env.AGENT_TOKEN || '';

function requireToken(req, res, next) {
  const token = req.header('x-agent-token');

  if (!AGENT_TOKEN || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function isValidSocketToken(token) {
  return Boolean(AGENT_TOKEN) && token === AGENT_TOKEN;
}

export { requireToken, isValidSocketToken };
