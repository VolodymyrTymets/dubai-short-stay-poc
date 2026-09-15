# account-avatar — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — account-avatar -->
Approved-by: volodymyr · 2026-09-15

Pattern followed: `web/packages/guest/src/pages/SignInPage.tsx` + `web/shared/api/auth/mutations.ts`
(the `auth-mutations-wiring` feature) — a gql operation file under `web/shared/api/auth/`, picked up by the
single root `web/codegen.ts`, consumed through a generated `use<Name><Type>` hook. This ticket adds the
query-side counterpart (`useAccountQuery`) instead of a mutation.

## Contract changes
- boundary: none — `api/src/account/account.resolver.ts`'s `account` query and
  `AccountProfileEntity`'s `firstName`/`lastName` fields already exist and are unchanged by this ticket.
- data: none.
- generated output: `web/shared/api/generated.graphql.tsx` (gitignored) regenerates via `(cd web && yarn
  codegen)` once `query.ts` adds the new operation — needs `api/`'s dev server running per the standing
  RUNBOOK requirement.

## Requirements (ordered, each independently verifiable)

### R1 — Add the `Account` query operation and regenerate the hook (S)
- files: `web/shared/api/auth/query.ts` (new — `ACCOUNT_QUERY`, `query Account { account { id
  AccountProfile { firstName lastName } } }`)
- layer: web shared API layer (gql operation, mirrors `mutations.ts`)
- test: none (`web/` has no test runner — per `ARCHITECTURE.md`)
- executed how: `(cd api && yarn start:dev)` in one terminal, then `(cd web && yarn codegen)`; confirm
  `useAccountQuery` is emitted into `web/shared/api/generated.graphql.tsx`
- risk: none

### R2 — Shared `Account` component (S/M)
- files: `web/shared/components/Account.tsx` (new)
- layer: shared component (`web/shared/components/`, per `ARCHITECTURE.md`'s shared-code row)
- behaviour: calls `useAccountQuery({ skip: !getAccessToken() })`; on no token or a query `error`, renders a
  `Link` (react-router) to `/sign-in` reading "Sign in"; on data, computes initials from
  `AccountProfile.firstName`/`lastName` (single-char fallback `"?"` if both are empty) and renders the
  existing `Avatar`. Takes the same `size` prop `Avatar` already takes so both call sites keep their current
  sizing (32 on `guest`, 36 on `host`).
- test: none (no test runner)
- executed how: exercised indirectly through R3/R4's browser checks (nothing renders this standalone yet)
- risk: initials/link markup differs enough between `Header` (avatar wrapped in an "open menu" button) and
  `Topbar` (bare avatar) that `Account` may need a `render`-style prop or two call sites rather than one
  fixed markup shape — resolve while implementing R3, keep R4 consistent with whatever shape R3 lands on

### R3 — Wire into `guest` (S)
- files: `web/packages/guest/src/Layout.tsx` (change: drop `userInitials` prop), `web/shared/components/
  Header.tsx` (change: replace the `userInitials` prop + inline `Avatar` with `<Account />`, add the
  signed-out "Sign in" state per R2)
- layer: web app shell
- test: none
- executed how: `yarn dev:guest`, load `/` signed out → see "Sign in" link → `/sign-in` → sign in with a
  seeded/local test account → navigate back to `/` → header shows real initials without a manual reload
  (AC4)
- risk: `Header` is shared-imported by `guest` only today; confirm `host` doesn't also import it before
  changing its prop signature (it doesn't — `host` uses its own local `Topbar.tsx`)

### R4 — Wire into `host` (S)
- files: `web/packages/host/src/Layout.tsx` (change: drop `userInitials` prop passed to `Topbar`),
  `web/packages/host/src/Topbar.tsx` (change: replace the `userInitials` prop + inline `Avatar` with
  `<Account />`)
- layer: web app shell
- test: none
- executed how: `yarn dev:host`, same signed-out → signed-in walkthrough as R3 on `:3002`
- risk: none beyond R3's

## Docs to update in this PR
- [ ] `docs/features/account-avatar/spec.md` — acceptance criteria checked off
- [ ] `docs/ARCHITECTURE.md` — update the "Known constraints and landmines" bullet about `Header`/`Topbar`'s
  hardcoded `userInitials` TODOs to reflect they're now resolved (name-based initials + sign-in link);
  avatar *images* stay noted as not-yet-built

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| `useAccountQuery`'s `skip` doesn't re-evaluate after `signIn`/`signUp`'s `navigate('/')` if `Header`/`Topbar` don't actually re-render on that transition | Header would show "Sign in" even when freshly authenticated until a manual reload — breaks AC4 | Manually verify in the browser during R3 before writing R4 the same way; if it doesn't react, refetch on mount is the fallback, not a new context |
| Expired/invalid stored token causes a `useAccountQuery` GraphQL error on every signed-out-but-token-present page load | Console noise, not a functional break (falls back to "Sign in" per the edge-case table) | Accept for this ticket; no global 401/logout handling exists yet anywhere in `web/` |

## Assumptions
- Avatar images (`avatarId`) are out of scope — see spec.md's explicit out-of-scope list.
- `host`'s sidebar "Keys Please" static block is untouched — it needs `HostProfile` data this query doesn't
  fetch.
- No sign-out button is added — nothing today calls it, and adding one is a separate, small follow-up once
  someone needs to test the signed-out state after having signed in (for now: clear `localStorage` in
  devtools, or use a private window).
