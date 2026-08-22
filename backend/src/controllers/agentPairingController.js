import crypto from 'node:crypto';
import Agent from '../models/agentModel.js';
import { isConnected } from '../services/agentService.js';

const USER_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PAIRING_TTL_MS = 10 * 60 * 1000;

function generateUserCode() {
  const pick = (n) =>
    Array.from({ length: n }, () => USER_CODE_CHARS[crypto.randomInt(USER_CODE_CHARS.length)]).join('');
  return `${pick(4)}-${pick(4)}`;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createDeviceCode(req, res) {
  const deviceCode = crypto.randomBytes(24).toString('hex');
  const userCode = generateUserCode();
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS);

  await Agent.create({ deviceCode, userCode, status: 'pending', expiresAt });

  res.status(201).json({ deviceCode, userCode, expiresIn: PAIRING_TTL_MS / 1000 });
}

async function getDeviceToken(req, res) {
  const { deviceCode } = req.query;
  if (typeof deviceCode !== 'string' || !/^[0-9a-f]{48}$/.test(deviceCode)) {
    return res.status(400).json({ error: 'deviceCode is required' });
  }

  const agent = await Agent.findOne({ deviceCode });
  if (!agent) {
    return res.status(404).json({ error: 'Unknown device code' });
  }

  if (agent.status === 'pending' && agent.expiresAt < new Date()) {
    agent.status = 'expired';
    await agent.save();
  }

  if (agent.status === 'expired') {
    return res.status(410).json({ error: 'Pairing code expired' });
  }

  if (agent.status === 'pending') {
    return res.json({ status: 'pending' });
  }

  const agentToken = agent.pendingToken;
  if (agentToken) {
    agent.pendingToken = null;
    await agent.save();
  }

  res.json({ status: 'claimed', agentToken, agentId: agent._id.toString() });
}

async function claim(req, res) {
  const { userCode } = req.body;
  if (typeof userCode !== 'string' || !userCode.trim()) {
    return res.status(400).json({ error: 'userCode is required' });
  }

  const agent = await Agent.findOne({
    userCode: userCode.toUpperCase().trim(),
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });

  if (!agent) {
    return res.status(404).json({ error: 'Invalid or expired code' });
  }

  const agentToken = crypto.randomBytes(32).toString('hex');
  agent.tokenHash = hashToken(agentToken);
  agent.pendingToken = agentToken;
  agent.userId = req.userId;
  agent.status = 'claimed';
  await agent.save();

  res.json({ ok: true });
}

async function listAgents(req, res) {
  const agents = await Agent.find({ userId: req.userId, status: 'claimed' })
    .sort({ lastSeenAt: -1, createdAt: -1 })
    .lean();

  res.json({
    agents: agents.map((agent) => ({
      id: agent._id.toString(),
      name: agent.name,
      kind: agent.kind,
      connected: isConnected(agent._id.toString()),
      lastSeenAt: agent.lastSeenAt,
    })),
  });
}

export { createDeviceCode, getDeviceToken, claim, listAgents, hashToken };
