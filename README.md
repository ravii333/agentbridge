# AgentBridge

AgentBridge pairs an AI coding agent running on your PC with a mobile app, so you can watch it
work and approve every tool call from your phone — like a self-hosted "remote control" for
Claude Code and Codex CLI, via a pluggable adapter layer that more coding CLIs can join over time.

## Features

- **Remote monitoring** — watch your coding agent's live output/tool calls from your phone as it works, not just the final result.
- **Per-tool approvals with diff view** — for adapters that support it (Claude Code today), approve or deny each tool call from the mobile app before it runs, with a diff of the change.
- **Multi-agent, multi-device** — pair multiple machines/agents to one account and switch between them from the app.
- **Workspace picker** — choose which working directory an agent operates in, from the phone.
- **Run history** — past runs are persisted per user and browsable in the app.
- **Device-code pairing** — link a new machine by entering a short code in the app, no manual token copying.
- **Pluggable adapters** — Claude Code and Codex CLI supported today via `agentbridge-client/adapters/`; more CLIs can be added the same way.
- **Self-hostable** — run your own backend + MongoDB relay (Docker Compose provided) instead of depending on a hosted one.

## Tech Stack

| Component | Stack |
|---|---|
| `agentbridge-client/` | Node.js, Socket.io client, `dotenv`; published to npm as `agentbridge` |
| `backend/` | Node.js, Express, Socket.io, MongoDB (Mongoose), JWT (`jsonwebtoken`), `bcryptjs`, `express-rate-limit` |
| `mobile/` | Expo / React Native, React Navigation, `expo-secure-store`, Socket.io client |
| `frontend/` | React, Vite |
| Infra | Docker / Docker Compose (backend + MongoDB) |

## Architecture

- `agentbridge-client/` — runs on the machine with your coding CLI installed. Wraps the CLI
  (Claude Code or Codex CLI today, via `adapters/`), pairs with your account via a short device
  code, and relays live output/approvals over a socket to the backend. Published to npm as
  `agentbridge`, runnable via `npx agentbridge`.
- `backend/` — Express + Socket.io + MongoDB relay. JWT accounts, device-code pairing, a
  multi-agent registry (several paired machines per user), and per-user scoped run history.
- `mobile/` — the real client (Expo/React Native). Login, connect/switch agents, live feed,
  approval prompts with diff view, workspace picker, run history. Ships with real AgentBridge
  branding (logo, launch screen, app icons — see `mobile/assets/brand/`).
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
3. **agentbridge-client** (on the machine with your coding CLI installed and on `PATH`)

   Once published, this runs via `npx` from anywhere — no checkout needed:
   ```
   npx agentbridge
   ```
   Wraps Claude Code by default; for Codex CLI, put `AGENT_KIND=codex` in a `.env` file in
   whichever folder you run that command from first. See `agentbridge-client/README.md` for the
   full config table and how approvals differ between the two.

   Working on agent-client itself? Run it from source instead:
   ```
   cd agentbridge-client
   npm install
   cp .env.example .env   # set BACKEND_URL if not localhost, AGENT_KIND if not Claude Code
   npm start
   ```

   Either way, first run prints a short pairing code — enter it in the mobile app's "Add agent"
   screen (it'll ask which CLI you're setting up) to link that machine to your account.
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

- `agentbridge-client` needs the CLI it's wrapping installed and reachable: `claude` for Claude
  Code, `codex` for Codex CLI.
- Approvals differ by adapter. Claude Code has real per-tool interactive approval via a local-only
  HTTP server (`HOOK_SERVER_PORT`, default 8787) that its hook calls before each tool use, relayed
  to your phone. Codex CLI's `codex exec` isn't interactive at all — there's no per-action prompt
  to intercept, so `PERMISSION_MODE` instead picks its upfront sandbox policy for the whole run,
  and the app shows that honestly rather than faking a prompt. Either way, nothing outside
  `agentbridge-client` can reach that local server.
- Running two agents on the same machine at once needs two `HOOK_SERVER_PORT` values — the
  default will conflict between them.
- See `VISION.md` for the fuller design rationale and roadmap.

## License

MIT — see [LICENSE](LICENSE).
