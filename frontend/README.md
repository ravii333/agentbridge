# agentbridge-frontend

The public marketing/landing page for AgentBridge — not the app itself (that's `mobile/`), just
the page that explains it and links to the source. Live at
https://agentbridge-ecru.vercel.app/.

## Stack

React + Vite, plain CSS (no framework). No env vars, but the deployed relay's URL is hardcoded
in `App.jsx` (`BACKEND_URL`) — the nav's status pill does a client-side `fetch` to its `/healthz`
on load. Update that constant if the relay ever moves.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build   # outputs to dist/
npm run serve   # preview the production build locally
```

## Structure

- `src/App.jsx` — page content: hero copy, features list, "works with" agent strip,
  how-it-works steps, get-started section. Update this when a feature ships or an adapter
  (Claude Code, Codex CLI, ...) changes status.
- `src/components/BrandMark.jsx` — the AgentBridge logo mark as inline SVG, reused in the nav,
  hero, and footer. Mirrors the mark in `mobile/assets/brand/`.
- `src/components/TerminalMockup.jsx` / `PhoneMockup.jsx` — the illustrative hero mockups.
- `useBackendStatus`/`StatusPill` in `src/App.jsx` — pings the relay's `/healthz` and renders the
  live/offline/checking pill in the nav. Gives it up to 45s before calling it offline, since the
  relay runs on a free Render instance that spins down when idle.
- `src/App.css` — all styling, including the logo draw-in and live-status pulse animations.
- `public/icon.svg` — favicon, same mark as `BrandMark` on the brand's dark background.

## Deploying (Vercel)

This lives inside the AgentBridge monorepo, so when importing the project in Vercel, set
**Root Directory** to `frontend` — the repo root has no `package.json` and `npm install` will
fail there.

If `npm install` ever fails on Vercel with an `ETARGET`/resolution error, check that
`package.json`'s `vite` (and other) version ranges actually exist on npm and that
`package-lock.json` is in sync with `package.json` — a stale lockfile from a prior dependency set
will resolve fine locally (existing `node_modules`) but fail on Vercel's clean install. Regenerate
with `rm -rf node_modules package-lock.json && npm install` if that happens.

## Source

https://github.com/ravii333/agentbridge (this is the `frontend/` directory of that repo)
