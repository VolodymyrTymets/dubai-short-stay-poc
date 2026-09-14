# ui-component-library — shared React component library for `web/shared/`

## Problem
`guest` and `host` are both scaffold-stage SPAs (`App.tsx` is a placeholder). Every mockup in
`designs/dss-v1-web-mockups-html/` (Guest search/booking, Host listings/calendar, Admin queues) reuses the
same primitives — buttons, inputs, badges, avatars, the search bar, the header, property/booking cards, nav
sidebars — as documented and named in `designs/dss-v1-web-mockups-html/Components.html`. Today none of
these exist as code: `web/shared/components/` doesn't exist on disk at all, and `web/shared/theme.css`
doesn't either, even though both `guest/src/index.css` and `host/src/index.css` already
`@import "../../../shared/theme.css"` — that import currently resolves to nothing.

## Goal / business value
Ranked goal #3 (`BUSINESS_MODEL.md`): "Reuse across `guest` and `host`... anything genuinely shared (design
tokens, the Apollo client, domain types) goes in `web/shared/` rather than being duplicated, so the two apps
don't drift." It also unblocks goal #1 (validate the concept fast) — every upcoming guest/host screen plan
needs these primitives, so building them once now is cheaper than duplicating per-screen and reconciling
later.

## Scope
- in:
  - `web/shared/theme.css` — created from `designs/dss-theme.css` (currently referenced by both apps' CSS
    but missing).
  - `web/shared/components/` — one `.tsx` file per component, per `Components.html`: `Logo`, `Button`,
    `Badge`, `Avatar`, `Input`, `Checkbox`, `Radio`, `Switch`, `Tabs`, `SearchBar` (hero + compact variant),
    `Header`, `PropertyCard`, `BookingCard`, `Sidebar` (light/host + dark/admin variant), plus a small
    shared `icons.tsx` for the handful of inline SVG icons reused across ≥2 components (search, chevron,
    heart, star, checkmark, menu, globe, arrow-right — each used at least twice in `Components.html`).
  - A visual verification surface: `web/packages/guest/src/App.tsx` is turned into a live showcase page
    that imports and renders every shared component (mirroring `Components.html`'s sections), so each
    requirement can be opened in a real browser per rule B1. `host/src/App.tsx` gets a minimal smoke import
    (Logo + one Button) to prove the shared path resolves from both apps, per ADR-006's "neither app imports
    the other's `src/`, only `web/shared/`" boundary.
- **out (explicit):**
  - Wiring these components into real guest/host screens (`SearchResults`, `PropertyDetail`,
    `HostListings`, etc.) — that is per-screen work for later `react-feature` plans.
  - Any data/GraphQL wiring — every component here is presentational only, props in, JSX out. No Apollo
    queries, no `useEffect` fetches.
  - Real carousel/interaction behaviour for the property card's photo dots, the avatar dropdown menu, or
    date-picker behaviour inside the search bar/booking card — the mockups shows these as static states;
    building the actual interactive behaviour belongs to the screen that first needs it.
  - Forms library wiring (react-hook-form + zod) — `Input`/`Checkbox`/`Radio`/`Switch` here are controlled,
    presentational primitives only; wiring them into an actual form is out of scope until the first real
    form ships (`frontend-react.md` rule 8).
  - Fixing the `doc/` vs `designs/` path mismatch in `CLAUDE.md` / `ARCHITECTURE.md` / `protected-paths.md`
    (those reference `doc/DSS-SRS-v9 2.pdf` and `doc/designs/`; the real paths on disk are
    `designs/DSS-SRS-v9 2.pdf` and `designs/dss-v1-web-mockups-html/`) — flagged as a stale doc (rule E2)
    in the PR body, not fixed here, since `CLAUDE.md` is a protected/ask-first path and unrelated to this
    component work (rule C1).

## Acceptance criteria
- [ ] AC1 Given `web/shared/theme.css` exists with the tokens from `designs/dss-theme.css`, when
      `(cd web && yarn build:all)` runs, then both `guest` and `host` build clean (their `@import` resolves).
- [ ] AC2 Given each shared component file, when it's imported into the guest showcase `App.tsx` and viewed
      at `yarn dev:guest` (`:3000`), then it renders visually matching its section in `Components.html`
      (same colors/spacing/typography from the token layer, no hardcoded hex/px outside `theme.css`).
- [ ] AC3 Given `Button`/`Input`/`Checkbox`/`Radio`/`Switch`/`Tabs`, when used with keyboard only, then
      every interactive state (hover/focus/checked/disabled) is reachable and visibly focused (rule 15).
  - [ ] AC4 Given `host/src/App.tsx` imports `Logo` and `Button` from `web/shared/components`, when
        `yarn build:all` runs, then it builds clean — proving the shared path is consumable from both apps
        (ADR-006's boundary).
- [ ] AC5 Given `(cd web && yarn lint:all)`, then it passes with no new problems in `web/shared/**` or the
      touched `App.tsx` files.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| `Badge`/status dot needs a semantic color not yet in `theme.css` (e.g. a 6th status) | Not handled here — only the exact statuses shown in `Components.html` (confirmed/awaiting/pending/cancelled/draft/instant-book) get a variant; extend later with a real status | this spec |
| `Avatar` has no image, only initials | `Avatar` takes `initials: string` only — no `src`/image-upload path (no `File` upload flow is wired yet, see `FilesModule` in ARCHITECTURE.md) | this spec |
| `SearchBar`/`BookingCard` show static "Add dates"/"12 – 15 Oct" copy | Rendered from props with those mockup values as the default/story data, not hardcoded inside the component — a consumer screen supplies real values | this spec |
| Guest/host apps both need the shared path but Vite dev server watches `web/shared/` outside each app's root | Confirm HMR picks up `web/shared/` edits during `yarn dev:guest`/`dev:host` (Vite watches outside root by default unless configured otherwise) — verify during R1, note if it doesn't | R1 execution step |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | ADR-006 explicitly rejected "a shared component library from day one" as premature ("nothing has been built twice yet... revisit when the same non-trivial component is built twice") — this ticket does exactly that, before any screen exists in `guest`/`host` beyond the placeholder `App.tsx`. | The user's own instruction this session ("put components into `web/shared/component`") is the explicit human decision to revisit ADR-006 now, ahead of the stated trigger — building once from the documented design system (`Components.html`) is a different situation than the "don't extract after first duplication" case ADR-006 was really guarding against. I'll record a new ADR-007 superseding ADR-006's "premature" rejection with this decision and its date, in the same PR (rule E1/D1: a settled decision is only reopened explicitly, in writing). | **Yes — flagging before implementation; proceeding on your explicit instruction, but the ADR revisit needs your confirmation it reads correctly once written.** |
| 2 | `Components.html` shows the two app-navigation sidebars as "Host (light)" and "Admin (dark)" — but `AccountRoleType` only has `GUEST`/`HOST`/`ADMIN`, and the admin flows aren't part of either `guest`/`host` SPA per `ARCHITECTURE.md`'s repo layout table. | Build `Sidebar` as one component with a `variant: 'light' | 'dark'` prop (visual only) rather than a `role` prop — which app/role consumes which variant is a later screen decision, not this component's concern. | No — presentational-only choice, doesn't block. |
