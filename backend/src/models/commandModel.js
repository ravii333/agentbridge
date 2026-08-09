import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
  command: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Command', commandSchema);
