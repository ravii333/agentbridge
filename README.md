# AgentBridge

AgentBridge is a full-stack starter project for monitoring and controlling a local AI coding agent from a web/mobile interface.

## Architecture

- `backend/` - Express + Socket.io server, MongoDB, command relay, log persistence
- `agent-client/` - Local Node.js agent service, WebSocket client, dummy process runner
- `frontend/` - React + Vite dashboard, real-time logs, command input

## Run the project

1. Start MongoDB locally.
2. Run the backend:
   - `cd AgentBridge/backend`
   - `npm install`
   - `npm run dev`
3. Run the agent client:
   - `cd AgentBridge/agent-client`
   - `npm install`
   - `node index.js`
4. Run the frontend:
   - `cd AgentBridge/frontend`
   - `npm install`
   - `npm run dev`

## Notes

- The backend exposes Socket.io for real-time logging and command routing.
- The frontend connects to the backend and displays live agent status and logs.
- The agent client simulates an AI agent with a dummy child process and broadcasts logs.
