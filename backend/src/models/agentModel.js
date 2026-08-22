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
});

export default mongoose.model('Agent', agentSchema);
