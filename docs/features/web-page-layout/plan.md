# web-page-layout — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — web-page-layout -->
Approved-by: volodymyr · 2026-09-15

Pattern followed: `web/shared/components/` (ADR-007, `ui-component-library` ticket) for the reusable
chrome pieces — `Header.tsx` and `Sidebar.tsx` already exist there and already match
`Main.html`/`HostListings.html`'s header and sidebar+topbar shapes exactly (verified by diffing their
props/markup against the mockups), so this plan reuses them unchanged rather than rebuilding. For the
pieces used by only one app so far (`Footer`, `host`'s `Topbar`), ADR-006's "duplicate once, extract on
second use" applies — they land app-local, not in `web/shared/`. No existing precedent for routing in
this repo — `react-router` (current v7+ package name; `react-router-dom` is now a re-export shim per the
library's own docs) is introduced here for the first time, in **data mode**
(`createBrowserRouter` + `RouterProvider`, imported from `react-router` / `react-router/dom` — not the
Vite framework plugin, since `ARCHITECTURE.md` fixes this repo as "no meta-framework"). Per the
`/analyze` gate (rule D1), this is a new architectural pattern and gets `ADR-008-react-router-for-web.md`
in R1 — the same treatment `ui-component-library` gave ADR-007 before its first component landed.

## Contract changes
- boundary: none — no GraphQL/API surface touched.
- data: none.
- generated output: none regenerated.
- shared surface: `web/shared/components/icons.tsx` gains 8 new icon exports (Home, Listings, Calendar,
  Reservations, Messages, Earnings, Verification, Settings — SVG paths taken directly from
  `HostListings.html`, same stroke-icon pattern as the file's existing exports) for `host`'s `Sidebar`
  nav items. Purely additive — no existing icon changes shape or name.

## Requirements (ordered, each independently verifiable)

### R1 — ADR-008 + add `react-router` to both apps (S)
- files: `docs/decisions/ADR-008-react-router-for-web.md` (new — records the data-mode-over-framework-mode
  choice and the `react-router`/`react-router-dom` package-name change, per the `/analyze` gate), `web/packages/guest/package.json` (change: add `"react-router"` dependency), `web/packages/host/package.json` (same)
- layer: docs + dependency (protected path — `package.json` is "ask first" per `protected-paths.md`)
- test: none (no test runner configured for `web/`)
- executed how: `(cd web/packages/guest && yarn install)` / same for `host`; a trivial `import { createBrowserRouter } from 'react-router'` compiles under `tsc -b` — proven fully once R3/R5 build; capture `vite build`'s reported chunk size before/after adding the dependency as the bundle-delta evidence `frontend-react.md` rule 14 requires for any new dependency
- risk: none — React Router's own docs confirm v7/v8 support React 18+/19.2.7+ and this repo already pins `react@^19.2.8`

### R2 — `guest` chrome: `Footer` + `Layout` (M)
- files: `web/packages/guest/src/Footer.tsx` (new — brand blurb + Guests/Hosts link columns, from `Main.html`'s `<footer>`), `web/packages/guest/src/Layout.tsx` (new — renders shared `Header` with placeholder search-field values and a `// TODO:` noting real values come once search state exists, `<Outlet/>`, then `Footer`)
- layer: web UI, `guest`-local
- test: none (no test runner configured for `web/`)
- executed how: `yarn dev:guest`, open `http://localhost:3000` in a real browser, confirm header/footer visually match `Main.html`'s chrome, no console errors — screenshot
- risk: `Header`'s search-field props (`where`/`checkIn`/`checkOut`/`guests`) have no real state source yet — stubbed with placeholder strings, flagged with `// TODO:`

### R3 — `guest` routing + stub pages (M)
- files: `web/packages/guest/src/pages/HomePage.tsx`, `SignInPage.tsx`, `SignUpPage.tsx` (new — each just a `// TODO:` comment), `web/packages/guest/src/router.tsx` (new — `Layout` parent route with `index`/`sign-in`/`sign-up` children, plus a sibling `/dev/components` route rendering the existing `ComponentsShowcase` outside the chrome so it stays reachable, not deleted), `web/packages/guest/src/App.tsx` (change: renders `<RouterProvider router={router} />` instead of `<ComponentsShowcase/>`)
- layer: web UI, `guest`-local
- test: none (no test runner configured for `web/`)
- executed how: `yarn dev:guest`; visit `/`, `/sign-in`, `/sign-up`, `/dev/components` in a real browser — each resolves, chrome renders on the first three, showcase renders on the fourth, no console errors; `(cd web && yarn build:all)` passes; screenshot per route
- risk: none

### R4 — `host` chrome: `Topbar` + `Layout` + new icons (M)
- files: `web/shared/components/icons.tsx` (change: add the 8 new icon exports listed above), `web/packages/host/src/Topbar.tsx` (new — search pill + "Switch to travelling" + notification icon + avatar, from `HostListings.html`'s topbar), `web/packages/host/src/Layout.tsx` (new — shared `Sidebar` with `variant="light"` and the `HostListings.html` nav items (Today/Listings/Calendar/Reservations/Messages (2)/Earnings/Verification/Settings), `Topbar`, then `<Outlet/>`; no footer — `HostListings.html` has none)
- layer: web UI — icon additions are `web/shared/`, `Topbar`/`Layout` are `host`-local
- test: none (no test runner configured for `web/`)
- executed how: `yarn dev:host`, open `http://localhost:3002`, confirm sidebar/topbar visually match `HostListings.html`'s chrome, no console errors — screenshot
- risk: none — icons follow the file's existing stroke-icon pattern exactly

### R5 — `host` routing + stub pages (S)
- files: `web/packages/host/src/pages/HomePage.tsx`, `SignInPage.tsx`, `SignUpPage.tsx` (new — `// TODO:` stubs), `web/packages/host/src/router.tsx` (new — `Layout` parent, `index`/`sign-in`/`sign-up` children), `web/packages/host/src/App.tsx` (change: renders `<RouterProvider router={router} />`; the file's prior role as a "shared-import smoke test" is superseded — `Layout`/`Sidebar` already prove `web/shared/` resolves from `host`)
- layer: web UI, `host`-local
- test: none (no test runner configured for `web/`)
- executed how: `yarn dev:host`; visit `/`, `/sign-in`, `/sign-up` in a real browser — chrome + TODO stub render, no console errors; `(cd web && yarn build:all)` passes; screenshot per route
- risk: none

## Docs to update in this PR
- [ ] docs/features/web-page-layout/spec.md (acceptance criteria checked off)
- [ ] docs/ARCHITECTURE.md — "Known constraints and landmines" currently says `guest`/`host` have "no
      real screens, routing, or forms yet, only the placeholder/smoke-test `App.tsx`"; this goes stale
      the moment this PR lands (rule E2) — update it to describe the routed shell instead
- [ ] docs/DOMAIN_GLOSSARY.md — not touched, no new domain terms (Layout/Footer/Topbar/page names are UI
      structure, not domain nouns)
- [ ] docs/decisions/ADR-008-react-router-for-web.md — new, written in R1 (per the `/analyze` gate,
      rule D1 — see spec.md open question 3)

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| `react-router`'s data-mode `RouterProvider` import path (`react-router/dom` vs `react-router`) differs from older `react-router-dom` tutorials an implementer might reach for from memory | Wrong import compiles-but-warns or breaks `flushSync` behavior silently | Verified already via Context7 against the library's own current docs (R1) — implementer follows that, not memory |
| Mixing chrome-only `Layout` with a fully separate `/dev/components` route in the same router tree | Router tree easy to get subtly wrong (nesting `ComponentsShowcase` under `Layout` by mistake, adding guest chrome around it) | R3's executed-how step visits `/dev/components` explicitly and checks no `Header`/`Footer` chrome leaks in |

## Assumptions
- Bullet 1 of the original request ("Layout for host" + `Main.html`) is the `guest` app; bullet 2
  ("Layout for host" + `HostListings.html`) is the `host` app — confirmed with the user in chat.
- `Footer` and `host`'s `Topbar` are app-local, not promoted to `web/shared/components/`, per ADR-006 —
  only `Header`/`Sidebar` (already shared from the prior ticket) are reused as-is.
- "Sign" in the request means a Sign In page (`/sign-in`), distinct from `/sign-up`.
- No 404/catch-all route in this ticket — out of scope per spec.md's edge cases.
