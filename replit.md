# tekbytz.sports

tekbytz.sports helps football fans monitor fixtures across twelve leagues and receive browser notifications for the teams and moments they care about.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/matchday-alerts` — React + Vite web app with dashboard, alerts, and settings routes.
- `artifacts/api-server/src/routes/matchday.ts` — matchday API and the initial fixture/alert data source.
- `lib/api-spec/openapi.yaml` — source of truth for match, league, overview, and alert contracts.
- `lib/api-client-react/src/generated` — generated React Query client hooks.

## Architecture decisions

- The frontend talks to the shared API server through generated OpenAPI hooks.
- Browser Notifications are used for the first notification delivery path so the experience works without requiring a third-party account.
- Fixture and alert state currently lives in the API process; the API boundary is ready to swap to a live sports feed and persistent storage.

## Product

- Dashboard overview for live, upcoming, and finished matches.
- League and status filters across Premier League, Serie A, Bundesliga, La Liga, Ligue 1, Brasileirão, Liga Portugal, Belgian Pro League, MLS, Saudi Professional League, J1 League, and K League 1.
- Saved team alert rules for kickoff, goals, and final score events.
- Settings for browser notification permission and refresh cadence.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
