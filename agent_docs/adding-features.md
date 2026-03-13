# Adding features

## Before writing any code

1. Confirm which package(s) are affected: `client`, `server`, or both.
2. For server changes, identify whether the work is a new route, middleware, or service.
3. For client changes, identify whether the work is a new page, component, or data-fetching hook.

## Server

- New routes go in `server/src/routes/`. Create the file, define an Express `Router`, and mount it in `server/src/index.ts` under `/api/<resource>`.
- Keep `server/src/index.ts` as the entry point only — no business logic there.

## Client

- New pages go in `client/src/pages/`.
- Shared UI components go in `client/src/components/`.
- Data fetching should use the `VITE_API_URL` env var for the base URL so it works across environments.

## Both

- Do not add a dependency without checking if it already exists in the workspace.
- Prefer installing dev-only tools as `devDependencies`.
- After adding a dependency: `pnpm install` from the root.
