import { io } from 'socket.io-client';
import config from './config.js';

function connect() {
  return io(config.BACKEND_URL, {
    transports: ['websocket'],
    auth: { token: config.AGENT_TOKEN, clientType: 'agent' },
  });
}

export { connect };
