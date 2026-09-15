# auth-mutations-wiring — wire Sign In / Sign Up to the real API

## Problem
`AuthCard` (`web/shared/components/AuthCard.tsx`, from `auth-sign-in-sign-up`) is fully built and routed in
both `guest` and `host`, but is explicitly UI-only: submitting either form does nothing but flip local state
to a static "Confirm your email" panel. No GraphQL call happens. The API's `signIn`/`signUp` mutations
(`api/src/auth/auth.resolver.ts`, wired in `feat: switch signIn/signUp mutations from phone to email` (#10))
already take exactly the fields the form collects for login (email, password) and return
`AuthTokensEntity { accessToken, refreshToken }` with no OTP/email-verification step — so the confirm-email
panel this UI built to match the mockup has no real backend counterpart.

## Goal / business value
Ranked goal #1 (`BUSINESS_MODEL.md`) — a routed, styled auth screen that doesn't actually authenticate is a
polished dead end; wiring it to the real mutation is the next real flow. Goal #3 — the shared `AuthCard`
stays presentational and reusable by keeping the Apollo calls in each app's own page, matching the boundary
already established for `Header`/`Sidebar`.

## Scope
- in: GraphQL operation documents for `signIn`/`signUp` in `web/shared/api/`, picked up by both `guest`'s and
  `host`'s own `codegen.ts` (each generates its own typed client into its own `src/gql/`, per package,
  same as today).
- in: `AuthCard` becomes a controlled component (`onSubmit`, `loading`, `error` props) instead of owning
  fake submit state; the "Confirm your email" OTP step and its `code`/`step` state are removed from the real
  flow (decided in chat — no backend counterpart exists for it).
- in: `SignInPage`/`SignUpPage` in both `web/packages/guest/src/pages/` and `web/packages/host/src/pages/`
  call `useMutation` with the generated, per-app typed document, pass the handler down to `AuthCard`.
- in: on success, the returned `accessToken` is persisted to `localStorage` (`web/shared/api/token.ts`,
  new) and the app navigates to `/`.
- in: `web/shared/apollo/client.ts` gains a `setContext` link (`@apollo/client/link/context`, already
  installed at `3.14.1`) that reads the stored token and sets the `Authorization: Bearer <token>` header on
  every request, so the persisted token is actually usable by future authenticated calls.
- **out (explicit, decided in chat):** the sign-up form's first/last name fields are collected but not sent
  anywhere — `SignUpInput` has no name fields; setting them needs a second `updateAccountProfile` call,
  deferred to a follow-up ticket. The marketing-opt-in checkbox has no backend field at all and stays
  visual-only. No `refreshToken` handling (no refresh-on-expiry flow) — only `accessToken` is persisted, per
  the explicit ask to keep this pass simple. No react-hook-form/zod (decided in chat — the existing
  hand-rolled `useState` fields stay, deferred per `frontend-react.md` rule 8 to a separate ticket rather
  than adding a new dependency here). No sign-out UI, no route guarding of authenticated-only pages, no
  password-reset flow.

## Acceptance criteria
- [x] AC1 Given a visitor on `guest` `/sign-in` fills a valid email+password of an existing account and
      clicks "Log in", then `signIn` is called, `accessToken` lands in `localStorage`, and the app navigates
      to `/`.
- [x] AC2 Given a visitor on `guest` `/sign-up` fills first/last name (ignored), email, password and clicks
      "Create account", then `signUp` is called with only `{ email, password }`, `accessToken` is persisted,
      and the app navigates to `/`.
- [x] AC3 Given wrong credentials on `/sign-in`, then the mutation's `ApolloError` message renders inline in
      `AuthCard` (no crash, no unhandled rejection) and no token is written.
- [x] AC4 The same two flows (AC1/AC2) work identically in `host` at its own `/sign-in`/`/sign-up`.
- [x] AC5 Once a token is persisted, a subsequent GraphQL request from the same app sends
      `Authorization: Bearer <token>` (verified via the browser's network inspector).
- [x] AC6 `(cd web && yarn build:all)` and `(cd web && yarn lint:all)` pass; no new console errors on
      `/sign-in`/`/sign-up` in either app.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| `signUp` called for an email that already has an account | Server throws `ConflictException` (`ARCHITECTURE.md` flow 2) — surfaces as the same inline `ApolloError` message as AC3, no special-casing | this spec |
| `localStorage` unavailable (disabled storage) | Not handled — POC scope, low likelihood on target browsers; the token simply doesn't persist across reloads | this spec |
| Double-submit while a mutation is in flight | `Button` is `disabled` while `loading` is true | this spec |

## Open questions
| # | Question | Assumed answer | Needs a human? |
|---|----------|----------------|----------------|
| 1 | Wire the "Confirm your email" OTP panel as a real step, or drop it since `signIn`/`signUp` need no verification? | Drop it | Already answered in chat |
| 2 | Add react-hook-form + zod now (first real form, `frontend-react.md` rule 8) or keep hand-rolled state? | Keep hand-rolled state | Already answered in chat |
| 3 | Chain `updateAccountProfile` after `signUp` to save first/last name, or leave unwired? | Leave unwired | Already answered in chat |
| 4 | Attach the stored token to future requests now, or just persist it this pass? | Attach it now (`setContext` link) | Already answered in chat |
