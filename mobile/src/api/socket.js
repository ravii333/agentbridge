import { io } from 'socket.io-client';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export function createSocket(token) {
  return io(BACKEND_URL, {
    transports: ['websocket'],
    auth: { token, clientType: 'frontend' },
  });
}
