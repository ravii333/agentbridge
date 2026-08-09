# AgentBridge — Vision & Project Notes

*Written 2026-08-09 so the idea and current state don't get lost between sessions.*

## The Origin Idea

I want a **mobile app that connects to the AI coding agents (Claude Code, Codex, Cursor, etc.) running on my PC, laptop, or any other device**, so I can monitor and control them from my phone.

Concretely: if I kick off a task with an AI agent on my laptop and then walk into another room, I should be able to pull out my phone, see exactly what the agent is doing right now, read its progress/output, and send it new instructions — without needing to be sitting at that machine.

This matters because AI coding agents run long, semi-autonomous sessions. Being tied to the keyboard to babysit them defeats a lot of the point. A phone-based remote control turns "wait at my desk" into "check in whenever."

## What "Done" Looks Like

- Any device running a coding agent registers itself with a central bridge.
- From my phone, I can see a list of my devices/agents and what each is doing (idle / running / errored) in real time.
- I can read the agent's live output/progress as it works — not just a final result.
- I can send it a new instruction or follow-up mid-task, from anywhere.
- Multiple devices and multiple agents per device are all visible in one place.

## Architecture (three services)

```
Phone / Browser  ⇄  Backend (relay + persistence)  ⇄  Agent-client (runs on the PC/laptop)
```

- **`backend/`** — Express + Socket.io + MongoDB. Relays commands from the client to the agent, relays logs/status back, persists run history. Shared-secret token auth (`AGENT_TOKEN`) gates both the socket handshake and REST endpoints.
- **`agent-client/`** — Node.js service that runs *on the machine with the coding agent*. Wraps the real `claude` CLI in headless mode (`claude -p --output-format stream-json`), one invocation per instruction, chained together with `--resume <sessionId>` so a sequence of phone instructions feels like one continuous conversation with the agent. Streams structured events (assistant text, tool calls, tool results, run summaries) back to the backend.
- **`frontend/`** — React + Vite web dashboard. Today this is a **stand-in for the mobile app** — it proves the loop works, but it's not the end product.

## Staged Roadmap

| Stage | What | Status |
|---|---|---|
| 1 | Backend + agent-client core: real Claude Code CLI integration, shared-secret auth, structured event contract, Mongo persistence, single device/agent | **Done** (2026-08-09) |
| 2 | Web dashboard polish: chat-style log rendering, tool-use cards, run history browsing, responsive/installable PWA | Not started |
| 3 | Native mobile app (React Native), consuming the same socket/REST contract the web dashboard uses | Not started |
| 4 | Multi-device / multi-agent registry — today the backend tracks exactly one connected agent globally | Not started |
| 5 | Real user accounts (JWT login) instead of a single shared secret — `backend/src/utils/jwt.js` already exists as unused scaffolding for this | Not started |

## Current Limitations (be aware of these)

- **Single device, single agent.** The backend has one global "the agent" socket slot. Connecting a second agent-client would just replace the first.
- **Shared-secret auth only.** One `AGENT_TOKEN` value shared across all three services — fine for one person's own devices, not multi-user safe.
- **No mobile app yet.** The web dashboard is functional but is a temporary proxy for the real goal.
- **Headless, not interactive.** Each instruction spawns a fresh `claude -p` process (no long-lived interactive session) — context is preserved via `--resume`, not a persistent process. This is a deliberate design choice (Claude Code's scriptable mode is headless), not a bug.
- **MongoDB required locally** for the backend to fully start (log/run persistence).

## Where Things Live

- Full architecture + implementation plan for Stage 1: `C:\Users\ravik\.claude\plans\keen-popping-heron.md`
- Setup instructions: [README.md](README.md)
- Agent wrapper: [agent-client/agentRunner.js](agent-client/agentRunner.js)
- Auth: [backend/src/utils/auth.js](backend/src/utils/auth.js), [backend/src/sockets/socketManager.js](backend/src/sockets/socketManager.js)
