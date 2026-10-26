# Matchday Stats

Matchday Stats helps football fans monitor fixtures across twelve leagues and receive browser notifications for the teams and moments they care about.

## Run and operate

- `$env:PORT=5000; pnpm --filter @workspace/api-server run dev` — build and run the API server in PowerShell.
- `pnpm --filter @workspace/matchday-alerts run dev` — run the web app in development mode.
- `pnpm run typecheck` — type-check the libraries and workspace packages.
- `pnpm run build` — type-check and build all packages.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI specification.
- `pnpm --filter @workspace/db run push` — push database schema changes (development only).
- Required environment variables:
  - `PORT` — API server port, such as `5000`.
  - `DATABASE_URL` — PostgreSQL connection string.

Start the API server before the web app when running the full application locally.

## Technology stack

- pnpm workspaces, Node.js 24, and TypeScript 5.9
- API: Express 5
- Database: PostgreSQL with Drizzle ORM
- Validation: Zod and `drizzle-zod`
- API code generation: Orval from the OpenAPI specification
- Build: esbuild

## Project layout

- `artifacts/matchday-alerts` — React and Vite web app with dashboard, alerts, and settings routes.
- `artifacts/api-server/src/routes/matchday.ts` — matchday API and initial fixture and alert data source.
- `lib/api-spec/openapi.yaml` — source of truth for match, league, overview, and alert contracts.
- `lib/api-client-react/src/generated` — generated React Query client hooks.

## Architecture

- The frontend talks to the shared API server through generated OpenAPI hooks.
- Browser notifications are the initial notification delivery path, so the experience works without requiring a third-party account.
- Fixture and alert state currently lives in the API process; the API boundary is ready to swap to a live sports feed and persistent storage.

## Features

- Dashboard overview for live, upcoming, and finished matches.
- League and status filters across Premier League, Serie A, Bundesliga, La Liga, Ligue 1, Brasileirão, Liga Portugal, Belgian Pro League, MLS, Saudi Professional League, J1 League, and K League 1.
- Saved team alert rules for kickoff, goals, and final score events.
- Settings for browser notification permission and refresh cadence.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._
