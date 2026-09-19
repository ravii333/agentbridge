import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: 'My agent' },
  kind: { type: String, default: null },
  deviceCode: { type: String, required: true, unique: true },
  userCode: { type: String, required: true },
  tokenHash: { type: String, default: null },
  pendingToken: { type: String, default: null },
  status: { type: String, enum: ['pending', 'claimed', 'expired'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  lastSeenAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  // Live connection/presence state, updated on socket connect/disconnect and
  // status events. Persisted (rather than only in-memory) so any backend
  // instance can answer "is this agent connected" / "what's its status" -
  // see services/agentService.js.
  connected: { type: Boolean, default: false },
  liveStatus: { type: mongoose.Schema.Types.Mixed, default: null },
});

export default mongoose.model('Agent', agentSchema);
