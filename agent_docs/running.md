# Running Unipath

## Prerequisites

- Node 18+
- pnpm 10+ (`npm install -g pnpm`)

## First-time setup

```bash
pnpm install
```

## Environment variables

Each package has its own `.env` that is git-ignored. If missing, copy from `.env.example`:

| Package  | File           | Required vars              |
|----------|----------------|----------------------------|
| `client` | `client/.env`  | `VITE_API_URL`             |
| `server` | `server/.env`  | `PORT`, `NODE_ENV`         |

## Running

```bash
pnpm dev                              # both apps (recommended during development)
pnpm --filter @unipath/client dev     # client only  → http://localhost:3000
pnpm --filter @unipath/server dev     # server only  → http://localhost:4000
```

## Verifying the server is up

```bash
curl http://localhost:4000/api/health
# → {"status":"ok"}
```

## Common issues

**Port already in use** — kill the process holding the port: `lsof -ti :4000 | xargs kill`

**esbuild not built** — run `pnpm install` again; pnpm will rebuild the native binary.
