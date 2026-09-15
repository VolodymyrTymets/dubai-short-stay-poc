# Architecture

> What the system **is** and where code belongs. Structure truths only — no style preferences (those live in `.claude/rules/`).
> Update in the same PR as any structural change (rule E1).

## Repo layout
| Path | What lives here | Deployable? | Owner |
|------|-----------------|-------------|-------|
| `api/` | NestJS GraphQL backend + BullMQ worker, Prisma/PostGIS | Yes — two entry points (`src/main.ts`, `src/worker.ts`) from one `src/` | backend |
| `web/packages/guest` | Guest-facing React SPA (Vite, port 3000) | Yes | web |
| `web/packages/host` | Host-facing React SPA (Vite, port 3002) | Yes | web |
| `web/shared/` | Code shared by both web apps: `theme.css` (Tailwind v4 tokens), `apollo/client.ts` (Apollo factory), `components/` — the shared UI component library (`Logo`, `Button`, `Badge`/`Avatar`, `Input`/`Checkbox`/`Radio`/`Switch`/`Tabs`, `SearchBar`, `Header`, `PropertyCard`/`BookingCard`, `Sidebar`, `icons.tsx`), built per ADR-007 | No | web |
| `doc/` | Product reference: `DSS-SRS-v9 2.pdf` (SRS) and `designs/` (HTML/CSS mockups) | No | product |

There is no root `package.json`; `api/` and `web/` are managed independently and never import each other's code.

`docker-compose.yml` at the repo root brings up the full stack in containers — `api`, `worker`, `postgres`,
`redis`, plus `guest` and `host` (each a Vite dev server, built from `web/packages/*/Dockerfile` with a
build context of `web/` so `web/shared/**` is available at build time). `api/Dockerfile` and
`web/packages/*/Dockerfile` still live next to the code they build.

## Where data truth lives
- **PostgreSQL + PostGIS** (via Prisma, `api/prisma/schema.prisma` + `api/prisma/models/*.prisma`) is authoritative for all domain data: `Account`, `AccountProfile`, `AccountRole`/`AccountOnRole`, `AccountIdentity`, `Guest`, `Host`, `File`, plus system tables `Migration`, `DeletedHistory`. PostGIS is enabled but not yet used by any model — `Property.lat`/`lng` are plain `Float` columns for now (see ADR-007). Phase 1 of the SRS-to-Prisma migration (`docs/features/property-listing-schema/`) added the Property/Listing domain: `City`/`Area`/`Poi`/`AmenityCatalog`/`AccessibilityFeature` (catalog reference data), `HostProfile`/`HostKycDocument` (the SRS `Owner` entity, additively hung off `Host`), and `Property`/`PropertyAmenity`/`PropertyAccessibility`/`PropertyPhoto`/`RatePlan`. Later SRS phases (Booking, Payment, Review, …) are not built yet — see the spec's out-of-scope list.
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
| local | `http://localhost:3001/graphql` (API), `:3000` (guest), `:3002` (host) | local Postgres/PostGIS via `docker-compose` (repo root) or a local install | anyone |
| staging | not set up yet | — | — |
| production | not set up yet | — | **not the agent** (rule C5) |

## Key flows
### 1. OTP sign-in
Client calls `signInOtp` mutation → `AuthService`/`OtpAuthStrategyService` create/find an `Account` + `AccountProfile`, generate and send an OTP via `NotifierModule` (SMS or log strategy) → client calls `verifyOtp` → `JwtAuthStrategyService` issues access + refresh JWTs. Can fail on invalid/expired OTP or an unverified phone.

### 2. Paginated list query
A GraphQL query with `pagination`/`sorting`/`search` args (`api/src/common/input/*`) reaches a resolver → `PaginationService.findAllPaginated` maps the requested GraphQL fields to a Prisma `select` (`GraphToPrisma`) and runs `findMany` + `count` against the given collection.

### 3. Background job
API enqueues a job (e.g. SMS) via BullMQ/Redis → the separate worker process (`src/worker.ts`, `WorkerModule`) picks it up and runs the matching consumer in `src/background-workers/`.

### 4. Host property listing (`api/src/property/`)
Client calls `createProperty` → `PropertyResolver` (role-gated to `HOST`/`ADMIN`) → `PropertyService`
lazily gets-or-creates the calling account's `Host` row, creates the `Property` row plus its
`PropertyAmenity`/`PropertyAccessibility`/`PropertyPhoto` joins, `status: DRAFT`. `updateProperty`
re-checks row ownership in the service (not just the role guard) and, on a transition to `status: LIVE`,
enforces the SRS §B.12 locked rule: the owner's `HostProfile.kycStatus` must be `VERIFIED` and
`bankAccountVerified` must be `true`, else it throws `FORBIDDEN`. `myProperties`/`property(id)` are
scoped to the caller's own `Host` — no public/guest-facing listing query exists yet.

## External integrations
| Service | Purpose | Failure mode | Sandbox available? |
|---------|---------|--------------|--------------------|
| AWS S3 (`@aws-sdk/client-s3`) | file storage (`FilesModule`) | upload/presign errors surface as domain errors | use a test bucket/local stub |
| Sentry (`@sentry/nestjs`) | error tracking | disabled when `NODE_ENV=local` | n/a |
| SMS notifier | OTP delivery | falls back to a log-only notifier strategy | `NotifierModule`'s log strategy |

## Known constraints and landmines
- `api/src/common/pagination.service.ts` / `prismacashing.service.ts` index Prisma by a raw `collection: string` — legacy generic pattern, don't extend it (see CLAUDE.md project rules).
- `guest`/`host` each have a routed shell now (ADR-008, `react-router` in data mode): a `Layout` per app
  (`guest`: shared `Header` + a `guest`-local `Footer`; `host`: shared `Sidebar` + a `host`-local `Topbar`,
  no footer) wraps `<Outlet/>`. `Home` is still an empty stub page — no real screen content yet. `Sign In`/
  `Sign Up` now render a shared `AuthCard` (`web/shared/components/AuthCard.tsx`, `AuthOtpInput.tsx`) built
  to match `designs/dss-v1-web-mockups-html/AuthSignUp.html`: a Log in/Sign up tab switcher, the form
  fields, and a 6-digit "Confirm your email" panel. This is **UI only** — no `signInOtp`/`verifyOtp`
  mutation is wired yet, and the form's password fields don't match this repo's actual OTP-only auth flow
  (`AuthService`/`OtpAuthStrategyService`, flow 1 above) — see `docs/features/auth-sign-in-sign-up/spec.md`
  open question 1 for the tracked mismatch to resolve when the real mutations are wired. `web/shared/
  components/` has the full design-system component set (ADR-007) ready to consume; `frontend-react.md`'s
  rules start mattering fully once a real (data-connected) screen is built inside these shells. `guest`'s
  prior `ComponentsShowcase` entry point lives at the sibling `/dev/components` route.
- `yarn start:dev`, `yarn test:e2e` (via full `AppModule`) and `yarn codegen` need live Postgres/PostGIS + Redis; `yarn test` (unit) and the rest of `yarn test:e2e` run standalone against in-memory PGlite.
- No CI existed before this PR; `api/`'s lint (55 pre-existing problems) and one placeholder e2e test (`expect(true).toEqual(false)` in `update-account-profile.e2e-spec.ts`) are known, pre-existing failures — not introduced by this setup.
- `yarn test:e2e`'s default (parallel) Jest workers can flake under load as the e2e suite grows — each worker boots its own in-memory PGlite + full `AppModule` (BullMQ/Redis included), and the default 5000ms hook timeout can be exceeded by CPU contention alone, not a real bug. `yarn test:e2e --runInBand` runs serially and is the reliable way to get a clean signal; it can hang on exit due to an unrelated pre-existing open-handle issue (Jest logs "did not exit one second after the test run has completed") — the test results themselves print before that hang, so read those and don't wait for the process to exit on its own.
