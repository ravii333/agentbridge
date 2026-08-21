import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
  command: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  agentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

commandSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Command', commandSchema);
