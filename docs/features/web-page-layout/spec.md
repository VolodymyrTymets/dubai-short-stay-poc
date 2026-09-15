# web-page-layout — basic page layout + routing shell for `web/`

## Problem
`guest` and `host` (`web/packages/*`) have no router and no page shell today — each app's `src/App.tsx`
is a single placeholder/smoke-test component (`ComponentsShowcase` for `guest`, a shared-import smoke
test for `host`). There is nowhere for a real screen to live, and no chrome (header/footer for `guest`,
sidebar/topbar for `host`) wraps a page. This blocks starting any real Guest or Host screen.

## Goal / business value
Serves ranked goal #1 in `BUSINESS_MODEL.md` — "get an end-to-end guest booking flow and host listing
flow working ... over polishing any single screen." A routed shell with chrome is the prerequisite
scaffolding for wiring the next real flow into either app.

## Scope
- in: add `react-router` (current v7+ package name — `react-router-dom` is now a re-export shim, per
  React Router's own docs) to `guest` and `host`; build a `Layout` per app wrapping `<Outlet/>` with
  chrome only (no page-body content copied from the mockups); three empty stub pages per app (Home,
  Sign In, Sign Up) with a `// TODO:` comment in place of real content; wire a data router
  (`createBrowserRouter`/`RouterProvider`) in each app's entry point.
- **out (explicit):**
  - Any real page-body content, form fields, or business logic on Home/Sign In/Sign Up — stub only.
  - Auth wiring (no `signInOtp`/`verifyOtp` GraphQL calls) — these pages are empty shells.
  - Route guards / protected routes — nothing to guard yet, both apps are fully public stub shells.
  - Removing or replacing `guest`'s `ComponentsShowcase.tsx` — it stays reachable (see AC7), not deleted
    (rule C1 — not this ticket's job to remove).
  - Any GraphQL/API/DB change — this is presentational + routing scaffolding only.
  - A design-token or shared-component change — `Header`/`Sidebar` are reused as-is; no new tokens needed
    (`web/shared/theme.css` already has every color this scaffolding uses, confirmed by grep).

## Acceptance criteria
- [ ] AC1 `guest`'s `Layout` renders the shared `Header` (`web/shared/components/Header.tsx`, reused
      unchanged) plus a new `guest`-local `Footer`, matching
      `designs/dss-v1-web-mockups-html/Main.html`'s header/footer chrome — no page body.
- [ ] AC2 `host`'s `Layout` renders the shared `Sidebar` (`web/shared/components/Sidebar.tsx`, reused
      unchanged, `variant="light"`) plus a new `host`-local `Topbar`, matching
      `designs/dss-v1-web-mockups-html/HostListings.html`'s sidebar/topbar chrome — no page body, no
      footer (that mockup has none).
- [ ] AC3 `guest` has three routed, empty pages — `/` (Home), `/sign-in` (Sign In), `/sign-up`
      (Sign Up) — each rendering a `// TODO:` comment only, nested under `Layout`.
- [ ] AC4 `host` has the same three routed, empty pages under its own `Layout`.
- [ ] AC5 `yarn build` (`tsc -b && vite build`) passes for both `guest` and `host` with `react-router`
      as a real dependency (not just devDependency/type-only).
- [ ] AC6 Both apps' dev servers (`yarn dev:guest` / `yarn dev:host`) serve all three routes in a real
      browser with no console errors, and the chrome visually matches the referenced mockup's
      header/footer or sidebar/topbar.
- [ ] AC7 `guest`'s existing `ComponentsShowcase` stays reachable at a dev-only route (`/dev/components`)
      instead of being deleted or silently orphaned.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Unknown path (e.g. `/foo`) in either app | No dedicated 404 page in this ticket — out of scope; router's default "no match" behavior is acceptable for a POC stub shell | assumed answer below |
| `host`'s mockup has no footer | `host`'s `Layout` has no footer slot at all — do not invent one to mirror `guest` | spec (explicit, from design reference) |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | The request's two bullets both say "Layout for host" but reference two different mockups (`Main.html`, which has no "Host" badge and has guest-style nav; `HostListings.html`, which explicitly says "Host" and is a sidebar dashboard) | It's a copy-paste duplication in the request; bullet 1 → `guest` app + `Main.html`, bullet 2 → `host` app + `HostListings.html` | Confirmed with the user in chat before this plan was written — no further confirmation needed |
| 2 | `Main.html`'s footer and `guest`'s `Header` are each used by only one app so far — does ADR-006's "duplicate once, extract on second use" mean the new `Footer` and `host`'s `Topbar` should be local to their app, not added to `web/shared/components/`? | Yes — build `Footer` in `web/packages/guest/src/` and `Topbar` in `web/packages/host/src/`, not in `web/shared/components/`. `Header`/`Sidebar` are reused unchanged because they already exist in `web/shared/` from the prior `ui-component-library` ticket (ADR-007) — not re-litigating that placement, just not adding two more single-use components there | No — follows the already-accepted ADR-006 rule directly |
| 3 | Is a new ADR needed for choosing `react-router`? | Yes — `/analyze` blocked the first draft of this plan on rule D1: introducing the repo's first routing library, and choosing data-mode (`createBrowserRouter`/`RouterProvider`) over the Vite framework plugin, is a new architectural pattern, not a stylistic detail — the same bar that made `ui-component-library` write ADR-007 before its first component. `docs/decisions/ADR-008-react-router-for-web.md` is written in R1, before any router code lands | No — resolved by the gate itself |