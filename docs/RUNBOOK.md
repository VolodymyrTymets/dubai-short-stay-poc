# Runbook

> How to run this project, and what goes wrong. Written for a human joining on day one — and read by the agent when the environment misbehaves.

## First run

### `api/`
```bash
cd api
yarn install
# create .env (see api/README.md for the full variable list: PORT, DATABASE_URL, REDIS_*, JWT_*)
docker-compose up -d --build      # Postgres+PostGIS and Redis, or run both locally instead
yarn prisma-migrate                # applies migrations to your local DATABASE_URL
yarn start:dev                     # API on :3001
yarn worker:start:dev               # worker, separate process
```
Node is pinned to **22.16.0** (`api/Dockerfile`'s `FROM node:22.16.0-alpine`) — match it locally.

### `web/`
```bash
cd web
yarn install
# each package needs its own .env with VITE_GRAPHQL_URL=http://localhost:3001/graphql
yarn dev:guest    # :3000, needs the API running for real data
yarn dev:host     # :3002
```

### Both at once
```bash
sh launch.sh   # opens terminal tabs: api (redis-stack-server + worker + api dev) and web (guest + host)
```

### Both at once, in Docker
```bash
docker-compose up -d --build   # repo root: api, worker, postgres, redis, guest, host as containers
```
No local Node/Postgres/Redis install needed. `api`/`worker` build from `api/Dockerfile`; `guest`/`host`
build from `web/packages/*/Dockerfile` with a build context of `web/` (so `web/shared/**` is picked up).
Ports match the local setup: API `:3001`, guest `:3000`, host `:3002`, Postgres `:5432`, Redis `:6379`.

## Commands
See the command map in `CLAUDE.md` — that is the canonical list.

## Undocumented steps everyone knows
- After touching `api/prisma/schema.prisma` or `api/prisma/models/*.prisma`, run `yarn prisma-migrate`
  (creates + applies a migration) and `yarn prisma-gen` (regenerates the client) — the Prisma client under
  `api/generated/prisma/` will otherwise be stale.
- After touching a resolver/entity's shape, restart `yarn start:dev` if `api/schema.gql` doesn't pick up
  the change, then re-run `yarn codegen` in whichever `web/` package consumes it — `src/gql/**` is stale
  until you do.
- `yarn test` and `yarn test:e2e` need **no** Docker/Redis — they run against PGlite in-memory Postgres
  with PostGIS via `DataCooker` (`api/test/utils/DataCooker/DataCooker.ts`). Only `yarn start:dev`/
  `worker:start:dev` and `yarn codegen` need the real Postgres+Redis stack.

## Common failures
| Symptom | Cause | Fix |
|---------|-------|-----|
| `yarn codegen` hangs or errors resolving the schema | No API dev server running on `VITE_GRAPHQL_URL` | Start `yarn start:dev` in `api/` first (with a real DB) |
| API dev server won't boot | Missing/incorrect `DATABASE_URL` or Redis not reachable | Check `docker-compose ps`; confirm `.env` matches `api/README.md` |
| PGlite test errors | `DATABASE_DIR` not writable, or `.env.test` missing | Ensure `NODE_ENV=test` and `DATABASE_DIR=/tmp/pglite` in `api/.env.test` |
| `yarn lint` in `api/` shows ~55 pre-existing problems | Existing lint debt, not something you introduced | Don't fix opportunistically (rule C1); only fix lines your PR touches |
| `update-account-profile.e2e-spec.ts`'s "Should add avatar to account profile" test fails | It's an unfinished placeholder (`expect(true).toEqual(false)`), not a real regression | Leave it unless your PR is the one implementing that test |

## Release
No release process exists yet — this is a local-only POC (see `docs/ARCHITECTURE.md`'s Environments table).
Define staging/production deploys via an ADR before the first one happens.
