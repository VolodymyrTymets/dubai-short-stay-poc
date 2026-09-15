# auth-mutations-wiring — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — auth-mutations-wiring -->
Approved-by: volodymyr · 2026-09-15 — approved in chat: requested directly ("Need to finis sign in, sing up
pipline — create mutations in web/shared/api, use codegen to generate mutations, use mutation in sign in
sign up page, keep access token in local storage"), plus the follow-up decisions in spec.md's open questions.

Pattern followed: per-app `codegen.ts` (`ui-component-library`'s already-configured
`@graphql-codegen/client-preset`, `documents: ['src/**/*.{ts,tsx}']`) generates each app's own typed client
into its own `src/gql/` from the live schema. Verified via Context7 against the library's own current docs
(`graphql-code-generator`) that the `documents` glob accepts plain `.graphql` files anywhere on disk, not
just `.tsx` source — so a shared `web/shared/api/*.graphql` folder can be added to both packages' globs and
each package still generates its own named `<Operation>Document` locally, with no change to the existing
per-app generation model. `web/shared/apollo/client.ts`'s `setContext` usage was verified against the
actually-installed `@apollo/client@3.14.1` source (`web/node_modules/@apollo/client/link/context/index.d.ts`)
rather than Context7's default (v4) docs, which describe a newer `SetContextLink` class this version doesn't
export.

## Contract changes
- boundary: none — `signIn`/`signUp`/`AuthTokensEntity` already exist and are unchanged (landed in #10).
- data: none.
- generated output: `web/packages/guest/src/gql/**` and `web/packages/host/src/gql/**` (gitignored,
  protected path — never hand-edited) regenerate via `yarn codegen` in each package once the API dev server
  is running.
- shared surface: `web/shared/api/` is new (`auth.graphql`, `token.ts`); `web/shared/apollo/client.ts` and
  `web/shared/components/AuthCard.tsx` change shape (props).

## Requirements (ordered, each independently verifiable)

### R1 — Shared GraphQL operations + codegen wiring (S)
- files: `web/shared/api/auth.graphql` (new — `SignIn`/`SignUp` mutations, fields matching
  `SignInPasswordInput`/`SignUpInput`/`AuthTokensEntity`), `web/packages/guest/codegen.ts` and
  `web/packages/host/codegen.ts` (change: `documents` gains `'../../shared/api/**/*.graphql'`)
- layer: web codegen config (`codegen.ts` is an "ask first" protected path)
- test: none (no test runner for `web/`)
- executed how: with the API dev server running (`yarn start:dev` in `api/`, real Postgres+Redis),
  `(cd web/packages/guest && yarn codegen)` and `(cd web/packages/host && yarn codegen)` each run clean and
  emit `SignInDocument`/`SignUpDocument` into their own `src/gql/graphql.ts`
- risk: the shared `.graphql` file must stay in exact sync with the live schema's input/output field names —
  a schema-introspection-based codegen run will fail loudly (not silently) if it drifts, which is the safety
  net

### R2 — `AuthCard` becomes controlled, OTP step removed (M)
- files: `web/shared/components/AuthCard.tsx` (change: drop `step`/`code` state and the whole "confirm"
  branch and its `AuthOtpInput` import; add `onSubmit(fields: { email: string; password: string }): void`,
  `loading?: boolean`, `error?: string | null` props; submit button calls `onSubmit`, is `disabled` while
  `loading`, and an inline error message renders under it when `error` is set)
- layer: `web/shared/` (used by both apps)
- test: none
- executed how: `yarn build:all` type-checks the new prop contract against both pages (R3); visual/keyboard
  re-check deferred to R3's browser pass since `AuthCard` has no standalone harness
- risk: `AuthOtpInput.tsx` becomes unused after this change — left in place (not deleted) since removing a
  component file is outside this ticket's scope (rule C1); flagged in the PR body, not acted on here

### R3 — Wire `SignInPage`/`SignUpPage` in both apps + token persistence + auth header (L)
- files: `web/shared/api/token.ts` (new — `getAccessToken`/`setAccessToken`), `web/shared/apollo/client.ts`
  (change: `setContext` link reads the stored token and sets `Authorization`), `web/packages/guest/src/pages/SignInPage.tsx` + `SignUpPage.tsx`, `web/packages/host/src/pages/SignInPage.tsx` + `SignUpPage.tsx`
  (change: each calls `useMutation` with its own generated document, passes `onSubmit`/`loading`/`error` to
  `AuthCard`, persists the token and navigates to `/` on success)
- layer: web UI + data layer, per-app pages + shared apollo client
- test: none (no test runner for `web/`)
- executed how: `yarn dev:guest` / `yarn dev:host` against a real running `api/` — sign up a new account,
  confirm the network tab shows the real `signUp` mutation and response, confirm `localStorage` has the
  token, confirm redirect to `/`; sign in with wrong credentials, confirm the inline error renders; sign in
  with the account just created, confirm a subsequent request carries the `Authorization` header — screenshot
  each state
- risk: `signUp` on an email that already exists throws `ConflictException` — falls through to a generic
  `INTERNAL_SERVER_ERROR` today (`ARCHITECTURE.md` flow 2's documented, pre-existing gap, not this ticket's
  to fix) — the inline error will show whatever generic message Apollo surfaces for it, acceptable for this
  pass per spec.md's edge cases

## Docs to update in this PR
- [x] docs/features/auth-mutations-wiring/spec.md (acceptance criteria checked off)
- [x] docs/ARCHITECTURE.md — "Known constraints and landmines" updated: the auth UI is no longer "UI
      only," the OTP panel removal and its rationale are recorded, and the CORS gap fix is noted
- [x] docs/DOMAIN_GLOSSARY.md — not touched, no new domain terms
- [x] docs/decisions/ADR-NNN — none; no new architectural pattern (reuses the existing per-app codegen model
      and the existing Apollo client factory)

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| `yarn codegen` needs the API dev server up; if it isn't, both packages' codegen fails or hangs (`RUNBOOK.md`) | Blocks R1's verification | Start `api/`'s dev server first, confirmed reachable, before running codegen |
| Removing the OTP step changes previously-signed-off UI behaviour (`auth-sign-in-sign-up`'s AC3) | A visual regression from a prior ticket's acceptance criteria | Explicitly re-decided in chat this session, recorded in spec.md's open question 1 — not a silent regression |

Two gaps surfaced only once R3 actually exercised the flow in a real browser (neither was introduced by this
ticket — both existed the moment before this ticket, just never triggered, since no browser client had ever
called the API cross-origin, and no package had ever built with a real generated GraphQL operation):
- `api/` had no CORS configuration at all — the browser's preflight `OPTIONS /graphql` came back `400`.
  Fixed with `app.enableCors({ origin: [...] })` in `main.ts` for the two local dev origins.
- Both `codegen.ts`'s `client` preset defaulted to regular (non-type-only) imports in its generated
  `fragment-masking.ts`/`gql.ts`/`graphql.ts`, which fails `tsc -b` under this repo's `verbatimModuleSyntax`.
  Fixed with `config: { useTypeImports: true }` (a sibling of `presetConfig`, not nested inside it — verified
  against the installed `@graphql-codegen/client-preset@6.2.0` source after the option had no effect nested
  under `presetConfig`, contra a plausible reading of the docs) in both packages' `codegen.ts`.

## Assumptions
- Working on the current branch (`sin-in-workflow`, already a non-`main` worktree branch) rather than
  cutting a new `feat/*` branch, since this session's worktree was already set up for this work.
- Only `accessToken` is persisted; `refreshToken` is discarded (returned by the mutation, not stored) per
  the explicit "keep access token in local storage to simplify process" instruction.
- `web/shared/api/token.ts` calls `localStorage` directly with no try/catch — matches this repo's POC-stage
  pragmatism (`BUSINESS_MODEL.md`) rather than defending against a scenario (disabled storage) not currently
  relevant to this codebase's target browsers.
