# agentbridge

Pair the AI coding agent running on this computer (Claude Code today, more over time) with the
AgentBridge mobile app — watch it work and approve every tool call from your phone.

## Usage

```
npx agentbridge
```

First run prints a short pairing code. Open the AgentBridge app, tap "Add agent," and enter the
code to link this machine to your account. On future runs it reuses the saved credentials
(`~/.agentbridge/credentials.json`) and connects automatically.

## Requirements

- Node.js 18+
- The CLI it wraps installed and on `PATH` (`claude` by default — see `AGENT_KIND`/`AGENT_BIN`
  below for other adapters as they're added)

## Configuration

Environment variables (set inline, or in a `.env` file in the directory you run it from):

| Variable | Default | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://localhost:4000` | The AgentBridge relay to connect to |
| `AGENT_TOKEN` | _(unset)_ | Skip device-code pairing and use a static shared-secret token instead |
| `AGENT_CWD` | OS home directory | Initial working directory (changeable later from the app) |
| `AGENT_KIND` | `claude-code` | Which adapter drives the agent |
| `AGENT_BIN` | `claude` | The CLI binary to spawn |
| `AGENT_MODEL` | _(unset)_ | Model override, passed through to the CLI |
| `MAX_QUEUE` | `10` | Max queued commands before new ones are rejected |
| `PERMISSION_MODE` | `default` | Passed to the underlying CLI's permission mode |
| `HOOK_SERVER_PORT` | `8787` | Local-only HTTP server used to relay tool-use approval requests |

## How approvals work

Before the agent uses a tool, its hook mechanism calls a local HTTP server this process starts
on `HOOK_SERVER_PORT`. That request is relayed to your phone; nothing outside this process can
reach that server.

## Source

https://github.com/ravii333/agentbridge (this package is published from the `agentbridge-client/`
directory of that repo)
