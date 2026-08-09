# AgentBridge

AgentBridge lets you monitor and control a real [Claude Code](https://claude.com/claude-code) session running on your PC/laptop from a web dashboard (mobile app is a future stage — see Roadmap).

## Architecture

- `backend/` - Express + Socket.io server, MongoDB, command relay, run/log persistence, shared-secret auth
- `agent-client/` - Local Node.js service that wraps the real `claude` CLI (headless `-p` mode, chained via `--resume` for session continuity), streams structured events over Socket.io
- `frontend/` - React + Vite dashboard, real-time logs, command input

## Setup

Requires: MongoDB running locally, and the [Claude Code CLI](https://claude.com/claude-code) (`claude`) installed and authenticated on the machine that will run `agent-client`.

1. **Backend**
   - `cd backend && npm install`
   - `cp .env.example .env` and set `AGENT_TOKEN` to a random secret (shared by all three services)
   - `npm run dev`
2. **Agent client** (runs on the machine with the coding agent)
   - `cd agent-client && npm install`
   - `cp .env.example .env` — set `AGENT_TOKEN` (same value as backend), and `AGENT_CWD` to the absolute path of the project you want the agent to work in
   - `npm run start`
3. **Frontend**
   - `cd frontend && npm install`
   - `cp .env.example .env` — set `VITE_AGENT_TOKEN` (same value as backend)
   - `npm run dev`

## Notes

- All three services must share the same `AGENT_TOKEN` — the backend rejects sockets/REST calls without it.
- The agent-client spawns `claude -p --output-format stream-json`, resuming the same session id across turns so multi-step instructions from the dashboard keep context.
- Commands are queued (FIFO) if one is still running; only one `claude` invocation runs at a time per agent.
- Currently single-device/single-agent. `backend/src/utils/jwt.js` is unused scaffolding for a future real-accounts auth stage.

## Roadmap

1. ~~Backend + agent-client core with real Claude Code integration~~ (done)
2. Web dashboard polish — chat-style rendering, run history, PWA installability
3. Native mobile app (React Native) against the same socket/REST contract
4. Multi-device/multi-agent support
