import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
const ADAPTER_COLLECTION = 'socket.io-adapter-events';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
  });
}

// Backs the socket.io mongo-adapter, which fans out socket broadcasts across
// backend instances via change streams - only possible against a replica
// set. Local/dev setups typically run a plain standalone mongod (per
// backend/.env.example), so this returns null rather than throwing when
// there's no replica set: the caller falls back to socket.io's default
// single-process adapter, which is exactly today's (single-instance)
// behavior. Only a production MONGO_URI with ?replicaSet=... (see
// docker-compose.yml) gets the cross-instance adapter.
async function getAdapterCollection() {
  const client = mongoose.connection.getClient();
  const hello = await client.db().admin().command({ hello: 1 });
  if (!hello.setName) return null;

  const collection = client.db().collection(ADAPTER_COLLECTION);
  try {
    // A TTL index cleans up delivered/expired packets instead of a capped
    // collection, since capped collections can't have their size changed later.
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
  } catch {
    // index already exists
  }
  return collection;
}

export default connectDB;
export { getAdapterCollection };
