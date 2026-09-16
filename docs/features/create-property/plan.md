# create-property — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — create-property -->
Approved-by: volodymyr · 2026-09-16

Pattern followed: `web/packages/host/src/pages/SignUpPage.tsx` + `web/shared/components/AuthCard.tsx`
(a page component owning a typed codegen mutation hook and plain `useState` form fields — the repo's
actual first-form precedent, see spec.md's dependency note) and `web/shared/api/auth/mutations.ts`
(hand-written `gql` document consumed by `yarn codegen`).

**Explicit deviation from `.claude/rules/frontend-react.md` rule 8** (forms should use react-hook-form +
zod, "add it when the first form ships"): the `/analyze` gate flagged this as a real conflict between
that rule and the repo's actual precedent (`AuthCard` already shipped hand-rolled, with neither library
installed). Raised to a human during planning — decision: keep hand-rolling with `useState` for this
page too, no new dependency added (rule C2). Rule 8's wording is stale against actual practice; fixing
that repo-wide is out of scope for this ticket and is flagged in the PR body rather than resolved here.

## Contract changes
- boundary: none on the API — `createProperty` and `CreatePropertyInput` already exist and are unchanged.
- data: none.
- generated output: `web/shared/api/generated.graphql.tsx` regenerates from a new
  `web/shared/api/property/mutations.ts` document via `(cd web && yarn codegen)` (needs `api/`'s
  `yarn start:dev` running against a real Postgres+Redis, per `RUNBOOK.md`).

## Requirements (ordered, each independently verifiable)

### R1 — `createProperty` GraphQL document + codegen (S)
- files: `web/shared/api/property/mutations.ts` (new)
- layer: web data layer (`web/shared/api/`)
- content: a `CREATE_PROPERTY_MUTATION` `gql` document requesting `id`, `slug`, `status`, `title` back
  (enough for R3's success state) — variable shape matches `CreatePropertyInput` field-for-field per
  `api/src/property/dto/create-property.input.ts`.
- test: none (generated file, no test runner for `web/`) — codegen either succeeds and emits
  `useCreatePropertyMutation`, or fails loudly.
- executed how: `(cd api && yarn start:dev)` in one terminal (real DB/Redis up first), then
  `(cd web && yarn codegen)`; grep the output `generated.graphql.tsx` for `useCreatePropertyMutation`.
- risk: none.

### R2 — `CreatePropertyPage` shell: Basics + Location + Pricing sections (M)
- files: `web/packages/host/src/pages/CreatePropertyPage.tsx` (new)
- layer: web page component, built from `web/shared/components/` (`Input`, `Radio`, `Checkbox`,
  `Button`) — no new shared component, this page's layout is specific enough not to warrant one
  (`BUSINESS_MODEL.md`'s judgement example: duplicate once, extract on the second real use).
- content: controlled-input state for `title` (drives auto-slug), `slug`, `description`,
  `propertyType` (radio group over the 4 enum values), `bedrooms`/`bathrooms`/`maxGuests` (number
  inputs), one `beds` row (`type` text + `count` number), `areaId`/`cityId` (text inputs, labelled as
  "paste a known id" per spec's out-of-scope note), `lat`/`lng` (number inputs), `basePriceAed`,
  `cleaningFeeAed` (optional), `isInstantBook` (checkbox, default checked). Client-side validation
  mirrors `create-property.input.ts`'s constraints (slug regex/length, lat/lng range, required fields)
  before any submit is possible — this requirement stops short of wiring the actual submit call. Once
  the host types directly into the `slug` field, a `slugTouched` flag stops further auto-derivation from
  `title` (spec's edge case table).
- test: none automated (no `web/` test runner) — the field wiring itself is the thing to execute.
- executed how: `yarn dev:host`, open `http://localhost:3002/listings/new` (route added in R4), fill
  every field, confirm values reflect in state (React DevTools or a temporary `console.log` removed
  before commit) and that invalid slug/lat/lng block the Save button. Capture a screenshot of the
  rendered form (all sections visible) as evidence per `frontend-react.md`'s Verification section.
- risk: none.

### R3 — DET & compliance section + real `createProperty` submission (M)
- files: `web/packages/host/src/pages/CreatePropertyPage.tsx` (change: continue from R2)
- layer: same page component, now wired to `useCreatePropertyMutation` from R1.
- content: `detPermitNumber` (optional text input), `tdfPerBedroom` (optional number input, labelled
  "AED per bedroom per night"). **Amended post-review:** the Tourism Dirham Fee authorisation `Checkbox`
  originally planned here (per spec AC4) was dropped entirely during self-review — see spec.md's
  out-of-scope note; it was a required, legally-worded consent gate with no backing field to record it,
  the same fabricated-money-adjacent-UI problem the plan already cut the classification/expiry/upload
  fields for. Save
  (calls the mutation with all R2+R3 fields, disabled and labelled e.g. "Saving…" while
  `useCreatePropertyMutation`'s `loading` is true — `frontend-react.md` rule 7) and Discard
  (`navigate('/')`, per spec AC5) buttons. On success, render the returned `id`/`slug`/`status` inline
  (spec AC2). On a GraphQL error, render `error.message` inline without clearing form state (spec AC3).
- test: none automated — this is the requirement `execute` actually proves.
- executed how: with `api/`'s dev server + DB up and a signed-in `HOST`-role account (or an
  `ADMIN`-role account, both allowed per `@Roles`), submit the form for real; capture the network
  request/response (or server log) showing `createProperty` returning a `DRAFT` property with a new
  `id`, plus a screenshot of the rendered success state. Also execute and screenshot the
  unchecked-checkbox block (AC4) and one deliberate server error (e.g. a slug already used) to confirm
  AC3's inline-error path — three screenshots total (success, checkbox-blocked, server error), per
  `frontend-react.md`'s "screenshot per claimed state" verification rule.
- risk: an invalid `areaId`/`cityId` (no catalog query exists, see spec) throws a Prisma FK error the
  resolver doesn't map to a clean message — accepted as a known, pre-existing gap (not introduced here);
  the raw error still surfaces inline per AC3, which is enough for the DoD gate. Mitigate in testing by
  using real `Area`/`City` ids from the local seed (`api/prisma/seed` or a `city`/`area` row queried
  directly via `prisma studio` / a psql shell, since no GraphQL query exists to list them).

### R4 — Route + nav wiring (S)
- files: `web/packages/host/src/router.tsx` (change: add `{ path: 'listings/new', Component:
  CreatePropertyPage }`), `web/packages/host/src/Layout.tsx` (change: the existing static "Listings"
  `Sidebar` item becomes a real nav link to `/listings/new` — smallest change that makes R2/R3
  reachable from the app shell; the other stub nav items — Today/Calendar/Reservations/etc. — are left
  exactly as they are, per rule C1 scope discipline).
- layer: routing/shell.
- test: none automated.
- executed how: from `http://localhost:3002/`, click "Listings" in the sidebar, confirm the URL becomes
  `/listings/new` and the page from R2/R3 renders. Capture a screenshot of the sidebar click landing on
  the routed page.
- risk: none.

## Docs to update in this PR
- [x] `docs/features/create-property/spec.md` (acceptance criteria checked off)
- [x] `docs/ARCHITECTURE.md` — add a bullet under "Known constraints and landmines" documenting the new
      `host` route/page and its explicit scope cuts (mirrors how `guest-home-search` is documented there)
- [x] `docs/DOMAIN_GLOSSARY.md` — **amended post-review**: self-review flagged that "DET permit" and
      "Tourism Dirham Fee (TDF)" are new user-facing nouns in this PR's UI copy, so two rows were added
      (rule E1) — the original "not needed" call was wrong.
- [x] `docs/decisions/` — **amended post-review**: `ADR-009-hand-rolled-web-forms.md` records the
      hand-rolled-forms-vs-`frontend-react.md`-rule-8 decision as settled, per the reviewer's suggestion
      that the underlying rule conflict (not just this PR's instance of it) should be traceable.

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| No catalog query for `Area`/`City` means real ids must be found manually for manual testing | Slower manual verification, easy to hit an opaque FK error | Query the seed data directly (`psql`/Prisma Studio) once, keep a scratch note of 1-2 valid ids for R3's execution step |
| `CLAUDE.md`'s "default to react-hook-form + zod" note is stale (contradicted by `AuthCard`'s actual pattern) | A future reader may expect this page to use RHF/zod | Flag it explicitly in the PR body (rule E2) rather than silently deciding repo-wide policy in this ticket |
| Plain-text `areaId`/`cityId` inputs are a rough UX for a real host, later work will need a real catalog query | Acceptable for the stated POC goal #1, but is a known gap | Call it out in the PR body's "what is NOT covered" section |

## Assumptions
- A `HOST` or `ADMIN`-role signed-in account is available for manual verification (existing sign-up flow
  creates a guest account by default — confirm during R3 whether role elevation needs a manual DB/Prisma
  Studio update, since no self-serve "become a host" flow exists yet; if so, note the exact command used
  in the PR's evidence block).
- `cancellationPolicy` is left out of the form entirely; the server's `MODERATE` default applies.
- One `beds` row is sufficient for this ticket's form (spec's explicit scope cut) — `CreatePropertyInput`
  itself accepts an array, so this isn't a backend limitation, just a UI simplification.
