# Unipath

AI-powered university counselor for Central Asian high school students. Helps students navigate university admissions, compare programs, and build application plans.

## Structure

pnpm monorepo. Two packages — no shared packages yet.

```
unipath-2/
├── client/   @unipath/client  — React 18 + Vite + TypeScript (port 3000)
└── server/   @unipath/server  — Express + TypeScript (port 4000)
```

Both packages use `"type": "module"` (ES modules throughout — no CommonJS).

## Running the project

```bash
pnpm dev              # both apps concurrently
pnpm --filter @unipath/client dev
pnpm --filter @unipath/server dev
```

See `agent_docs/running.md` for environment setup and troubleshooting.

## Key conventions

- **ES modules only.** Use `import`/`export` everywhere. No `require()`.
- **Environment variables.** Each package owns its own `.env`. Client vars must be prefixed `VITE_` and accessed via `import.meta.env`. Server vars are loaded via `import 'dotenv/config'`.
- **API.** The Vite dev server proxies `/api/*` to `http://localhost:4000`. All server routes must be prefixed with `/api`.
- **TypeScript.** Strict mode is on in both packages. Do not loosen compiler options without a clear reason.

## Adding features

Before writing code for a new feature, read `agent_docs/adding-features.md`.

## Frontend

All frontend work lives in `client/`. Follow `client/STYLEGUIDE.md` for design decisions — colors, typography, spacing, motion, and voice.
