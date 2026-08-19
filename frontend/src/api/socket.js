import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export function createSocket() {
  return io(BACKEND_URL, {
    transports: ['websocket'],
  });
}
