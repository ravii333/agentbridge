# AgentBridge

AgentBridge pairs an AI coding agent running on your PC with a mobile app, so you can watch it
work and approve every tool call from your phone — like a self-hosted "remote control" for
Claude Code (and, via a pluggable adapter layer, other coding CLIs over time).

## Architecture

- `agentbridge-client/` — runs on the machine with your coding CLI installed. Wraps the CLI (Claude
  Code today, via `adapters/`), pairs with your account via a short device code, and relays
  live output/approvals over a socket to the backend.
- `backend/` — Express + Socket.io + MongoDB relay. JWT accounts, device-code pairing, a
  multi-agent registry (several paired machines per user), and per-user scoped run history.
- `mobile/` — the real client (Expo/React Native). Login, connect/switch agents, live feed,
  approval prompts with diff view, workspace picker, run history.
- `frontend/` — the project's public landing page (not a dashboard — that's `mobile/`'s job).

## Run it locally

1. **MongoDB** — either run it yourself, or use the bundled compose stack below.
2. **Backend**
   ```
   cd backend
   npm install
   cp .env.example .env   # set MONGO_URI / JWT_SECRET
   npm run dev
   ```
3. **agentbridge-client** (on the machine with `claude` installed and on `PATH`)
   ```
   cd agentbridge-client
   npm install
   cp .env.example .env   # set BACKEND_URL if not localhost
   npm start
   ```
   First run prints a short pairing code — enter it in the mobile app's "Add agent" screen to
   link that machine to your account.
4. **Mobile**
   ```
   cd mobile
   npm install
   cp .env.example .env   # on a real device, EXPO_PUBLIC_BACKEND_URL needs your machine's LAN IP, not localhost
   npm start
   ```

## Self-hosting the relay with Docker

If you're hosting the backend + MongoDB for yourself or a team rather than running Mongo by
hand, `docker-compose.yml` at the repo root bundles both:

```
cp .env.example .env   # set a real JWT_SECRET
docker compose up
```

`agentbridge-client` and `mobile` still run separately — they're what connects *to* that relay, on
the machine and phone respectively.

## Notes

- `agentbridge-client` needs the CLI it's wrapping (`claude`, by default) installed and reachable.
- Approval requests use a local-only HTTP server (`HOOK_SERVER_PORT`, default 8787) that the
  CLI's hook mechanism calls before each tool use; nothing outside `agentbridge-client` can reach it.
- See `VISION.md` for the fuller design rationale and roadmap.
