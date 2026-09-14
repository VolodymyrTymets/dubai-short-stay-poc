# Architecture

> What the system **is** and where code belongs. Structure truths only — no style preferences (those live in `.claude/rules/`).
> Update in the same PR as any structural change (rule E1).

## Repo layout
| Path | What lives here | Deployable? | Owner |
|------|-----------------|-------------|-------|
| `api/` | NestJS GraphQL backend + BullMQ worker, Prisma/PostGIS | Yes — two entry points (`src/main.ts`, `src/worker.ts`) from one `src/` | backend |
| `web/packages/guest` | Guest-facing React SPA (Vite, port 3000) | Yes | web |
| `web/packages/host` | Host-facing React SPA (Vite, port 3002) | Yes | web |
| `web/shared/` | Code shared by both web apps: `theme.css` (Tailwind v4 tokens), `apollo/client.ts` (Apollo factory), `components/` (reserved, currently empty) | No | web |
| `doc/` | Product reference: `DSS-SRS-v9 2.pdf` (SRS) and `designs/` (HTML/CSS mockups) | No | product |

There is no root `package.json`; `api/` and `web/` are managed independently and never import each other's code.

## Where data truth lives
- **PostgreSQL + PostGIS** (via Prisma, `api/prisma/schema.prisma` + `api/prisma/models/*.prisma`) is authoritative for all domain data: `Account`, `AccountProfile`, `AccountRole`/`AccountOnRole`, `AccountIdentity`, `Guest`, `Host`, `File`, plus system tables `Migration`, `DeletedHistory`. PostGIS is enabled for future geospatial queries (property location, search-by-area).
- **Redis** is a derived cache (multi-tier: in-memory `CacheableMemory` 60s TTL, falling back to Redis) and the BullMQ job-queue backend — never a source of truth.
- **Generated, never edited by hand:** `api/generated/prisma/**` (Prisma client), `api/schema.gql` (Apollo auto-generated schema), each web package's `src/gql/**` (graphql-codegen output, gitignored).

## Boundaries and contracts
| Boundary | Format | Source of truth | Generated output (never hand-edited) | Regeneration command |
|----------|--------|-----------------|--------------------------------------|----------------------|
| `api/` GraphQL server | GraphQL (Apollo Driver, code-first) | Resolvers + entity classes in `api/src/**` | `api/schema.gql` | restart the dev server / `yarn build` |
| `api/` ⇄ `web/*` contract | GraphQL operations | the live server's schema (introspection) | each package's `src/gql/**` | `yarn codegen` (needs the API dev server running) |
| `api/` ⇄ PostgreSQL | Prisma schema | `api/prisma/schema.prisma` + `api/prisma/models/*.prisma` | `api/generated/prisma/**` | `yarn prisma-gen` |

## Environments
| Env | URL | Database | Who may touch it |
|-----|-----|----------|------------------|
| local | `http://localhost:3001/graphql` (API), `:3000` (guest), `:3002` (host) | local Postgres/PostGIS via `docker-compose` or a local install | anyone |
| staging | not set up yet | — | — |
| production | not set up yet | — | **not the agent** (rule C5) |

## Key flows
### 1. OTP sign-in
Client calls `signInOtp` mutation → `AuthService`/`OtpAuthStrategyService` create/find an `Account` + `AccountProfile`, generate and send an OTP via `NotifierModule` (SMS or log strategy) → client calls `verifyOtp` → `JwtAuthStrategyService` issues access + refresh JWTs. Can fail on invalid/expired OTP or an unverified phone.

### 2. Paginated list query
A GraphQL query with `pagination`/`sorting`/`search` args (`api/src/common/input/*`) reaches a resolver → `PaginationService.findAllPaginated` maps the requested GraphQL fields to a Prisma `select` (`GraphToPrisma`) and runs `findMany` + `count` against the given collection.

### 3. Background job
API enqueues a job (e.g. SMS) via BullMQ/Redis → the separate worker process (`src/worker.ts`, `WorkerModule`) picks it up and runs the matching consumer in `src/background-workers/`.

## External integrations
| Service | Purpose | Failure mode | Sandbox available? |
|---------|---------|--------------|--------------------|
| AWS S3 (`@aws-sdk/client-s3`) | file storage (`FilesModule`) | upload/presign errors surface as domain errors | use a test bucket/local stub |
| Sentry (`@sentry/nestjs`) | error tracking | disabled when `NODE_ENV=local` | n/a |
| SMS notifier | OTP delivery | falls back to a log-only notifier strategy | `NotifierModule`'s log strategy |

## Known constraints and landmines
- `api/src/common/pagination.service.ts` / `prismacashing.service.ts` index Prisma by a raw `collection: string` — legacy generic pattern, don't extend it (see CLAUDE.md project rules).
- `web/` is still scaffold-stage: only `App.tsx`/`main.tsx`/`index.css` exist per package, no real screens, routing, or forms yet — most `frontend-react.md` rules will start mattering once real UI lands.
- `yarn start:dev`, `yarn test:e2e` (via full `AppModule`) and `yarn codegen` need live Postgres/PostGIS + Redis; `yarn test` (unit) and the rest of `yarn test:e2e` run standalone against in-memory PGlite.
- No CI existed before this PR; `api/`'s lint (55 pre-existing problems) and one placeholder e2e test (`expect(true).toEqual(false)` in `update-account-profile.e2e-spec.ts`) are known, pre-existing failures — not introduced by this setup.
