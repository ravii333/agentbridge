import { io } from 'socket.io-client';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const AGENT_TOKEN = process.env.EXPO_PUBLIC_AGENT_TOKEN;

export function createSocket() {
  return io(BACKEND_URL, {
    transports: ['websocket'],
    auth: { token: AGENT_TOKEN, clientType: 'frontend' },
  });
}
