# account-avatar — wire real Account data into the web header

## Problem
`guest`'s `Header` and `host`'s `Topbar`/`Layout` render an `Account`'s avatar (initials) and, on `guest`,
have no way to reach `/sign-in` at all — both were built with hardcoded placeholder props
(`userInitials="G"` / `"KP"`) and a `TODO(volodymyr, web-page-layout): ... once account data is wired`
left by the prior `web-page-layout` ticket. The backend already exposes a `account` query
(`api/src/account/account.resolver.ts`) returning the signed-in `Account` + `AccountProfile`
(`firstName`/`lastName`/...), but no web query operation, generated hook, or component consumes it yet —
`web/shared/api/` only has auth *mutations* (`signIn`/`signUp`) so far.

## Goal / business value
Serves ranked goal #1 (`docs/BUSINESS_MODEL.md`) — closes the last stub in the already-built sign-in/
sign-up flow so a signed-in user sees their own name-derived avatar instead of a hardcoded placeholder, and
a signed-out guest has a visible way to reach sign-in from the home page (today there is none — `HomePage`
is `return null` and `Header` has no auth-aware element).

## Scope
- in:
  - A new `Account` GraphQL query operation in `web/shared/api/auth/query.ts`, codegen'd to a
    `useAccountQuery` hook.
  - A new shared `Account` component (`web/shared/components/Account.tsx`) that calls `useAccountQuery` and
    renders either the real `Avatar` (initials from `firstName`/`lastName`) when signed in, or a "Sign in"
    link to `/sign-in` when not.
  - Wiring that component into `guest`'s `Header`/`Layout` and `host`'s `Topbar`/`Layout`, removing the
    hardcoded `userInitials` prop on both.
- **out (explicit):**
  - Avatar **images** (`AccountProfile.avatarId`/`Avatar`) — not exposed on `AccountProfileEntity` today,
    and not requested; this ticket is initials-only, matching what `Avatar.tsx` already renders. Wiring a
    real photo (upload UI, GraphQL field, S3 `publicUrl` in `Avatar`) is a separate, later ticket.
  - `host`'s sidebar footer block (`Layout.tsx`'s static "Keys Please" / DET permit card) — that needs
    `HostProfile` fields (DET permit) beyond what the `account` query returns; left as its existing TODO.
  - Sign-out / a global auth/session context — no such mechanism exists yet anywhere in `web/`; this ticket
    reads `getAccessToken()` directly per component, matching the existing `apollo/client.ts` pattern, not
    introducing new state management.
  - A "Sign up" link — only "sign in" was asked for; `AuthCard`'s existing tab switcher already reaches
    sign-up from the sign-in page.

## Acceptance criteria
- [ ] AC1 Given a signed-out visitor on `guest`'s home page (or any routed page), when the page renders,
      then the `Header` shows a "Sign in" link to `/sign-in` instead of an avatar.
- [ ] AC2 Given a signed-out visitor on `host`, when the page renders, then `Topbar` shows the same "Sign
      in" link instead of an avatar.
- [ ] AC3 Given a signed-in `guest`/`host` account with `firstName`/`lastName` set, when the page renders,
      then `Header`/`Topbar` shows `Avatar` with initials derived from the real account name (not
      hardcoded `"G"`/`"KP"`).
- [ ] AC4 Given a signed-in account that just completed `signIn`/`signUp` (token freshly set, no full page
      reload), when the resulting navigation to `/` completes, then the header updates to the signed-in
      state without a manual refresh.
- [ ] AC5 `yarn codegen` (from `web/`) produces a `useAccountQuery` hook from the new query operation, and
      `yarn build:all` (from `web/`) typechecks clean with it wired into both apps.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Access token present but expired/invalid | `useAccountQuery` errors (`UNAUTHENTICATED`); `Account` falls back to the "Sign in" link, same as signed-out | this plan (no global 401 handling exists yet — out of scope) |
| `firstName`/`lastName` both null (profile never completed) | `Avatar` gets a single-character fallback (`"?"`) rather than crashing on empty initials | this plan |
| Only `firstName` set | Initials use just that first letter | this plan |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | Should the query live under `web/shared/api/auth/` even though "current account" isn't strictly an auth concern? | Yes — user explicitly asked for `web/shared/api/auth/query.ts`, and it sits next to `token.ts`/`mutations.ts` which already mix auth+session concerns there. | No — explicit instruction |
| 2 | Does the signed-in state need to react without a manual refresh right after `signIn`/`signUp`? | Yes (AC4) — `navigate('/')` re-renders the route tree including `Header`/`Topbar` since they're siblings of `Outlet` inside the same `Layout`, and `getAccessToken()` is read fresh on that render, so `skip` flips off without extra state. Verified manually in the browser during implementation, not assumed. | No |
