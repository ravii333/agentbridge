import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, default: 'info' },
  runId: { type: String },
  seq: { type: Number },
  kind: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  agentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ runId: 1, seq: 1 });

export default mongoose.model('Log', logSchema);
