# agentbridge

Pair the AI coding agent running on this computer with the AgentBridge mobile app — watch it
work and approve every tool call from your phone. Supports Claude Code and Codex CLI today.

## Usage

```
npx agentbridge
```

Wraps Claude Code by default. To run it against Codex CLI instead, put this in a `.env` file in
whichever folder you run the command from:

```
AGENT_KIND=codex
```

First run prints a short pairing code. Open the AgentBridge app, tap "Add agent," pick which CLI
you're setting up, and enter the code to link this machine to your account. On future runs it
reuses the saved credentials (`~/.agentbridge/credentials.json`) and connects automatically.

Running two agents on the same machine at once (say, one Claude Code and one Codex)? Each is a
separate `npx agentbridge` process, in its own `.env`/directory, pairing separately in the app -
and each needs its own `HOOK_SERVER_PORT`, since the default (8787) will conflict otherwise.

## Requirements

- Node.js 18+
- The CLI it wraps installed and on `PATH`: `claude` for Claude Code, `codex` for Codex CLI

## Configuration

Environment variables (set inline, or in a `.env` file in the directory you run it from):

| Variable | Default | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://localhost:4000` | The AgentBridge relay to connect to |
| `AGENT_TOKEN` | _(unset)_ | Skip device-code pairing and use a static shared-secret token instead |
| `AGENT_CWD` | OS home directory | Initial working directory (changeable later from the app) |
| `AGENT_KIND` | `claude-code` | Which adapter drives the agent — `claude-code` or `codex` |
| `AGENT_BIN` | _(adapter's default)_ | The CLI binary to spawn — only set this if it's not on `PATH` under its usual name |
| `AGENT_MODEL` | _(unset)_ | Model override, passed through to the CLI |
| `MAX_QUEUE` | `10` | Max queued commands before new ones are rejected |
| `PERMISSION_MODE` | `default` | See "How approvals work" below — meaning differs per adapter |
| `HOOK_SERVER_PORT` | `8787` | Local-only HTTP server used to relay tool-use approval requests |

## How approvals work

This differs by adapter, and the mobile app is explicit about which one you're getting:

- **Claude Code** has real per-tool interactive approval: before it uses a tool, its hook
  mechanism calls a local HTTP server this process starts on `HOOK_SERVER_PORT`, which relays
  the request to your phone for a tap. `PERMISSION_MODE=default` prompts for every tool call;
  `acceptEdits`/`bypassPermissions` skip that for trusted, non-interactive setups.
- **Codex CLI** (`codex exec`) isn't interactive at all — there's no live per-action prompt to
  intercept. `PERMISSION_MODE` instead picks its upfront sandbox policy for the whole run:
  `default` → `read-only`, `acceptEdits` → `workspace-write`, `bypassPermissions` →
  `danger-full-access`. The app shows this honestly as "runs automatically under sandbox policy"
  rather than a fake approval prompt.

Either way, nothing outside this process can reach the local approval server.

## Source

https://github.com/ravii333/agentbridge (this package is published from the `agentbridge-client/`
directory of that repo)
