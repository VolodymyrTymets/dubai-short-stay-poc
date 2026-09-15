# ADR-008 — `react-router` (data mode) for `web/`'s first routing layer

- **Date:** 2026-09-15
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** web-page-layout

## Context
`guest` and `host` (`web/packages/*`) have had no router at all — each app's `src/App.tsx` was a single
placeholder/smoke-test component. This ticket adds the first real page shell (`Layout` + routed stub
pages) to both apps, which requires picking a routing library and a routing mode for the first time in
this repo. `ARCHITECTURE.md` already fixes `web/` as "React 19 + Vite, no meta-framework," so any option
requiring a framework-level build step (Next.js-style file routing, React Router's own Vite plugin/
"framework mode") is off the table without reopening that decision.

## Decision
Use `react-router` in **data mode** — `createBrowserRouter` (route tree definition) +
`RouterProvider`, imported from `react-router` and `react-router/dom` (the DOM-specific entry point that
enables `ReactDOM.flushSync()`), verified against the library's own current docs via Context7. Each app
gets its own `src/router.tsx` route tree with `Layout` as the top-level element and page components as
children. This is a plain dependency addition to each app's own `package.json` (`guest`'s and `host`'s,
never the workspace root, per `js-tooling.md` rule 3) — no Vite plugin, no file-based routing convention,
no server rendering.

One naming note for future readers: the current major version (v7+) collapsed `react-router-dom` into
the `react-router` package itself (`react-router-dom` now just re-exports it) — code and examples that
still `import from 'react-router-dom'` are following the pre-v7 convention; this repo uses `react-router`.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| React Router's Vite plugin / "framework mode" | Brings in server rendering / framework conventions `ARCHITECTURE.md` explicitly excludes for `web/` ("no meta-framework") |
| TanStack Router | No precedent or need for its type-safe route generation yet; `react-router` is the more common default and this repo has no existing opinion to override it |
| Hand-rolled routing (conditional rendering on `window.location`) | Loses browser history, nested layouts, and route-level code-splitting for no benefit — a real router is the standard tool for exactly this problem |

## Consequences
- Positive: both apps get browser history, nested layouts (`Layout` + `<Outlet/>`), and a path to
  route-level lazy-loading later, with one well-documented library instead of a hand-rolled scheme.
- Accepted cost: every future `web/` screen is added as a route in the relevant app's `router.tsx`,
  not as an ad hoc conditional in `App.tsx`.
- Follow-ups: route guards / protected routes are not introduced by this ticket — the first screen that
  needs auth-gating is the signal to add them.

## Revisit when
A real need for server rendering, streaming, or file-based route generation appears — that is the signal
to reconsider React Router's framework mode (or another framework) rather than data mode.
