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
- **Generated, never edited by hand:** `api/generated/prisma/**` (Prisma client), `api/schema.gql` (Apollo auto-generated schema), `web/shared/api/generated.graphql.tsx` (graphql-codegen output shared by both web apps, gitignored — see the codegen consolidation note below).

## Boundaries and contracts
| Boundary | Format | Source of truth | Generated output (never hand-edited) | Regeneration command |
|----------|--------|-----------------|--------------------------------------|----------------------|
| `api/` GraphQL server | GraphQL (Apollo Driver, code-first) | Resolvers + entity classes in `api/src/**` | `api/schema.gql` | restart the dev server / `yarn build` |
| `api/` ⇄ `web/*` contract | GraphQL operations | the live server's schema (introspection) | `web/shared/api/generated.graphql.tsx` | `yarn codegen` from `web/` (needs the API dev server running) |
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

### 2. Password sign-in and sign-up
Client calls the `signIn` mutation with an **email** and password → `JwtAuthStrategyService.signIn` looks up the non-deleted `Account` by email, bcrypt-compares the password against `AccountIdentity.hash` (always, even when no account/hash is found — compared against a fixed dummy hash — so a miss takes the same time as a real mismatch and can't be timed to detect account existence), and on a match issues access + refresh JWTs via `issueTokens`. This does **not** set `AccountProfile.isPhoneVerified` — that flag is specific to phone possession (see flow 1) and unrelated to email/password sign-in, so `refreshTokens` (OTP verification and token refresh) and `issueTokens` (password sign-in/sign-up) stay split for that reason. Fails with `UNAUTHENTICATED` when the account doesn't exist, is soft-deleted, has no password set, or the password doesn't match — the same generic error in all cases, so the response never reveals which.

The `signUp` mutation is the counterpart that sets a password: `JwtAuthStrategyService.signUp` looks up the non-deleted `Account` by email and throws (`ConflictException`) if **any** account already exists for that email — with or without a password. It only proceeds when the email is entirely new, creating a guest `Account` (via `AccountService.createGuestAccountByEmail`, a sibling of the phone-based `createGuestAccount` used by OTP sign-in), bcrypt-hashing the password into `AccountIdentity.hash`/`salt`, and issuing tokens via `issueTokens`. This "any existing account, not just a password-protected one" check is deliberate and load-bearing: an `Account`'s email can be set later via the `updateAccountProfile` mutation without ever setting a password (e.g. an OTP-only account that fills in its email afterwards), so a laxer check (only blocking when `hash` is already set) would let anyone who merely knows that email call `signUp` and attach their own password to the existing account — full takeover. Claiming an existing account with a password needs a separate, verified flow that doesn't exist yet; `signUp` deliberately refuses that case for now rather than allowing it. Sign-in/sign-up are keyed by email and OTP sign-in (flow 1) is keyed by phone — the two identifiers are independent, so an OTP-only account is never reachable through `signIn`/`signUp` unless its profile also has an email set.

Two accepted, documented tradeoffs: (1) unlike `signIn`'s single generic, timing-safe error, `signUp`'s `ConflictException` does confirm that an email is already registered — standard sign-up UX (matches most consumer apps), not something this change tries to hide. (2) `ConflictException` currently falls through to the generic `INTERNAL_SERVER_ERROR` GraphQL code — this repo has no custom error formatter yet (api-graphql.md rule 14 is not satisfied anywhere), only `UnauthorizedException` gets Apollo's built-in `UNAUTHENTICATED` mapping. No rate-limiting exists on any of the three sign-in/sign-up mutations yet, and neither `signUp` nor the pre-existing `signInOtp` wrap their account-creation + identity-write in a transaction or rely on a unique constraint on `AccountProfile.email`/`AccountProfile.phoneNumber` (there isn't one on either) — both are known, shared gaps tracked separately, not addressed by this change.

### 3. Paginated list query
A GraphQL query with `pagination`/`sorting`/`search` args (`api/src/common/input/*`) reaches a resolver → `PaginationService.findAllPaginated` maps the requested GraphQL fields to a Prisma `select` (`GraphToPrisma`) and runs `findMany` + `count` against the given collection.

### 4. Background job
API enqueues a job (e.g. SMS) via BullMQ/Redis → the separate worker process (`src/worker.ts`, `WorkerModule`) picks it up and runs the matching consumer in `src/background-workers/`.

### 5. Host property listing (`api/src/property/`)
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
  no footer) wraps `<Outlet/>`. `Home` now has real content (`guest-home-search`, see the dedicated bullet
  below) — only `host`'s `Home` is still an empty stub. `Sign In`/
  `Sign Up` render a shared `AuthCard` (`web/shared/components/AuthCard.tsx`) built to match
  `designs/dss-v1-web-mockups-html/AuthSignUp.html`'s Log in/Sign up tab switcher and form fields, now wired
  (`auth-mutations-wiring`) to the real `signIn`/`signUp` mutations (email+password — flow 2, not flow 1's
  OTP path, resolving the mismatch flagged by `auth-sign-in-sign-up`'s open question 1) via each app's own
  `SignInPage`/`SignUpPage` and a generated typed hook (`useSignInMutation`/`useSignUpMutation`) from
  `web/shared/api/generated.graphql.tsx`, codegen'd from the gql operations in `web/shared/api/auth/
  mutations.ts` — see the codegen consolidation note below. The mockup's
  6-digit "Confirm your email" panel was dropped from the real flow — `signIn`/`signUp` return tokens
  directly with no verification step, so the panel has no backend counterpart; `AuthOtpInput.tsx` is now
  unused (left in place, not deleted — flagged in `auth-mutations-wiring`'s PR body). On success the
  `accessToken` is persisted to `localStorage` (`web/shared/api/token.ts`) and `web/shared/apollo/client.ts`
  attaches it as `Authorization: Bearer <token>` to every subsequent request via a `setContext` link. First/
  last name and the marketing checkbox on the sign-up form are collected but not sent anywhere — `signUp`
  takes only email+password; wiring names needs a separate `updateAccountProfile` call, deferred. `api/src/
  main.ts` now calls `app.enableCors()` for the `guest`/`host` dev origins — no browser client had ever
  called the API cross-origin before this. `web/shared/components/` has the full design-system component
  set (ADR-007) ready to consume; `frontend-react.md`'s rules start mattering fully once a real
  (data-connected) screen is built inside these shells. `guest`'s prior `ComponentsShowcase` entry point
  lives at the sibling `/dev/components` route.
- **`Header`/`Topbar`'s hardcoded `userInitials` placeholder is resolved** (`account-avatar`): a new
  `ACCOUNT_QUERY` (`web/shared/api/auth/query.ts`, codegen'd to `useAccountQuery`) backs a shared `Account`
  component (`web/shared/components/Account.tsx`) that both `guest`'s `Header` and `host`'s `Topbar` now
  render instead of a static `Avatar`. Signed out, it shows a "Sign in" link to `/sign-in` (previously
  unreachable from the header on any page, including `Home`, then still a stub); signed in, it shows `Avatar`
  with initials derived from the real `AccountProfile.firstName`/`lastName` (falls back to `"?"` if both are
  empty, e.g. a phone-OTP account that never filled in a name). `web/shared/api/token.ts` now exposes
  `subscribeToAccessToken`, a small listener registry `Account` reads via `useSyncExternalStore` — a
  client-side route change alone (e.g. `signIn`'s `navigate('/')`) does not re-render sibling components
  like `Header`, so without this subscription the header stayed on "Sign in" until a manual reload despite a
  valid token already being stored. Avatar **images** (`AccountProfile.avatarId`/`Avatar` → S3 `publicUrl`)
  are still not exposed over GraphQL or wired into `Avatar`/`Account` — initials only, for now. `host`'s
  sidebar "Keys Please" block is untouched (needs `HostProfile` fields this query doesn't fetch).
- **`guest`'s `Home` is built and a new `SearchResultsPage` route exists** (`guest-home-search`): `HomePage`
  (`web/packages/guest/src/pages/HomePage.tsx`, replacing its prior `return null` stub) follows
  `designs/dss-v1-web-mockups-html/Main.html` — hero, a "Hand-picked" grid backed by the real public
  `properties` query (`api/src/property/property.resolver.ts`), a static "Why DubaiShortStay" section and a
  static host-CTA banner. The mockup's "Area guides" section (the 6-tile area image grid) was **not**
  built — explicit scope cut. A new `SearchResultsPage` (`web/packages/guest/src/pages/
  SearchResultsPage.tsx`, route `/search`) follows `designs/dss-v1-web-mockups-html/SearchResults.html` —
  filter-pill bar, results header, the same `properties`-backed 3-column grid — minus the mockup's map
  panel (explicit scope cut). Both pages share a new `PropertyResultsGrid`
  (`web/packages/guest/src/components/PropertyResultsGrid.tsx`) for the four required states (loading/
  error/empty/success) and a new `mapPropertyToCard` (`web/shared/api/property/mapPropertyToCard.ts`) that
  maps a `Property` row to `PropertyCard` props. The header's compact search icon (`Layout.tsx`'s
  `onSearch`) and the hero's "Search"/"Show all stays" controls all navigate to `/search`; the filter pills,
  sort control and pagination row on `/search` are **decorative** — the `properties` query has no matching
  filter args (only `search: { title, slug }`) and no total-count field to paginate against. Three fields
  the mockups want don't exist on `Property` yet and are **mocked**, not real data: the card image (a flat
  placeholder tile — `PropertyPhotoEntity` has no public URL, and even `FileEntity.publicUrl` would sign
  against S3 using the local seed's `picsum.photos` URL as if it were a real object key, producing a broken
  link), the card subtitle (derived from `Property.description`, truncated, since no dedicated subtitle
  field exists), and the "total price" (an illustrative fixed 3-night stay, since no `Booking`/length-of-
  stay model exists yet). See `docs/features/guest-home-search/spec.md`'s mocked-field table for the full
  reasoning — a later ticket should replace these once the underlying data exists.
- **Web codegen was consolidated from per-package to a single shared setup** (superseding the per-app model
  described in ADR-006 and the original `auth-mutations-wiring` plan): each of `guest`/`host` used to run
  its own `codegen.ts` (`@graphql-codegen/client-preset`) against `.graphql` documents under
  `web/shared/api/`, emitting a separate typed client into its own `src/gql/**`. Now a single root
  `web/codegen.ts` (`typescript-operations` + `typescript-react-apollo`) reads gql operations from
  `.ts`/`.js` files under `shared/api/**` (e.g. `web/shared/api/auth/mutations.ts`, replacing the old
  `web/shared/api/auth.graphql`) and emits one shared, hook-based client — `web/shared/api/
  generated.graphql.tsx` (gitignored) plus an `introspection.json` snapshot at the `web/` root — consumed
  by both apps via `useSignInMutation`/`useSignUpMutation`-style hooks instead of `useMutation(...Document)`.
  Run it as `(cd web && yarn codegen)`, not per-package. `web/packages/guest/codegen.ts` and
  `web/packages/host/codegen.ts` no longer exist.
- `yarn start:dev`, `yarn test:e2e` (via full `AppModule`) and `yarn codegen` need live Postgres/PostGIS + Redis; `yarn test` (unit) and the rest of `yarn test:e2e` run standalone against in-memory PGlite.
- No CI existed before this PR; `api/`'s lint (55 pre-existing problems) and one placeholder e2e test (`expect(true).toEqual(false)` in `update-account-profile.e2e-spec.ts`) are known, pre-existing failures — not introduced by this setup.
- `yarn test:e2e`'s default (parallel) Jest workers can flake under load as the e2e suite grows — each worker boots its own in-memory PGlite + full `AppModule` (BullMQ/Redis included), and the default 5000ms hook timeout can be exceeded by CPU contention alone, not a real bug. `yarn test:e2e --runInBand` runs serially and is the reliable way to get a clean signal; it can hang on exit due to an unrelated pre-existing open-handle issue (Jest logs "did not exit one second after the test run has completed") — the test results themselves print before that hang, so read those and don't wait for the process to exit on its own.
