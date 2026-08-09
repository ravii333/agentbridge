import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, default: 'info' },
  runId: { type: String },
  seq: { type: Number },
  kind: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Log', logSchema);
