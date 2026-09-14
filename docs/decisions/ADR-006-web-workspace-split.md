# ADR-006 — Two independent Vite/React SPAs (`guest`, `host`) sharing only `web/shared/`

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
Guests and hosts have very different screens (see `doc/designs/` — `SearchResults.html`/`TripDetail.html`
vs. `HostListings.html`/`HostCalendar.html`/`HostEarnings.html`) and likely different deploy/release
cadences and audiences.

## Decision
`web/` is a yarn workspace (`workspaces: ["packages/*"]`) with two standalone Vite + React + TypeScript
apps, `packages/guest` and `packages/host`, each with its own `package.json`, `vite.config.ts`,
`eslint.config.js` and per-app graphql-codegen. They share only `web/shared/`: `theme.css` (Tailwind v4
design tokens) and `apollo/client.ts` (an Apollo Client factory). Neither app imports the other's `src/`.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| One SPA with role-based routing | Guest and host are different enough audiences/flows that separate deploys and bundles make more sense |
| A shared component library from day one | Nothing has been built twice yet — premature per `frontend-react.md` rule 9; `web/shared/components/` is reserved but empty |

## Consequences
- Positive: each app can evolve, deploy and be bundled independently; no risk of one app's code leaking into the other.
- Accepted cost: any UI pattern needed by both apps must be deliberately promoted to `web/shared/` rather than happening automatically.
- Follow-ups: `web/shared/components/` exists as a placeholder but has nothing in it yet.

## Revisit when
The same non-trivial component is built twice — that's the signal to extract it into `web/shared/components/`.
