# ui-component-library — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — ui-component-library -->
Approved-by: volodymyr · 2026-09-14 — supersedes ADR-006 for this ticket

Pattern followed: none in-repo (`web/` is scaffold-stage — only `App.tsx`/`main.tsx`/`index.css` exist per
package, per `ARCHITECTURE.md`'s "Known constraints"). The precedent is the design system itself:
`designs/dss-v1-web-mockups-html/Components.html` (pixel/token source) plus `designs/dss-theme.css` (the
token file `web/shared/theme.css` is supposed to be, per both apps' already-present but currently-dangling
`@import "../../../shared/theme.css"`). Component shape/props follow `frontend-react.md` rules 6-11
(one component per file, typed props, tokens-only styling, no premature memoization).

**Flagged before starting:** this plan revisits ADR-006's rejection of "a shared component library from day
one" as premature, and runs directly counter to the named judgement example in `BUSINESS_MODEL.md`
("Duplicate a small piece of UI in `guest` and `host` vs. extracting it to `web/shared/` immediately →
Duplicate once, extract on the second real use") — see `spec.md` open question 1. Proceeding on the user's
explicit instruction this session, but per the `/analyze` gate's finding, **ADR-007 (the supersession
record) is written in R1, before any component lands** — not deferred to the end — so no requirement builds
on a still-informally-reopened decision. The human `Approved-by:` line below should be read as also
approving this supersession; say so explicitly (e.g. `Approved-by: <name> · <date> — supersedes ADR-006 for
this ticket`) if that reading is correct, or stop here if it isn't.

## Contract changes
- boundary: none — no GraphQL/API surface touched, no DB schema touched.
- data: none.
- generated output: none regenerated (no `schema.gql`/`codegen` touched — these are presentational
  components with no Apollo queries).

## Requirements (ordered, each independently verifiable)

### R1 — Theme foundation: `web/shared/theme.css` + ADR-007 (S)
- files: `web/shared/theme.css` (new — copied from `designs/dss-theme.css` verbatim; it's already the
  Tailwind v4 `@theme{}` token file both apps' `index.css` expect at that exact path),
  `docs/decisions/ADR-007-shared-component-library.md` (new — records revisiting ADR-006's "premature"
  rejection and the `BUSINESS_MODEL.md` duplication example, per spec open question 1 — written **first**,
  before any component file, per the `/analyze` gate finding), `web/shared/apollo/client.ts` (new —
  **scope addition, confirmed with the human during implementation**: both `guest/src/main.tsx` and
  `host/src/main.tsx` already import `createApolloClient` from this exact path, which didn't exist either —
  same class of pre-existing dangling `web/shared/` import as the missing `theme.css`, and blocked
  `yarn build:all` for both apps regardless of the theme fix. A minimal factory —
  `new ApolloClient({ link: new HttpLink({ uri }), cache: new InMemoryCache() })`, verified against Apollo
  Client's own docs — unblocks the build with no business logic)
- layer: shared/tokens (`web/shared/`) + docs
- test: none (no test runner for `web/`, per `CLAUDE.md` command map) — this is a static CSS file
- executed how: `(cd web && yarn build:all)` — currently the `@import` resolves to a missing file, so this
  proves both `guest` and `host` builds go from failing to clean. Then `yarn dev:guest` and `yarn dev:host`,
  confirm `bg-page`/`text-ink`/`font-serif` (already used in the placeholder `App.tsx`) render with the
  navy/cream/serif tokens instead of falling back to unstyled/default Tailwind.
- risk: none

### R2 — `Logo`, `icons.tsx` (S)
- files: `web/shared/components/Logo.tsx` (new), `web/shared/components/icons.tsx` (new — the handful of
  inline SVGs `Components.html` reuses ≥2×: `SearchIcon`, `ChevronDownIcon`, `ChevronRightIcon`,
  `HeartIcon`, `StarIcon`, `CheckIcon`, `MenuIcon`, `GlobeIcon`, `ArrowRightIcon`)
- layer: `web/shared/components/`
- test: none (no `web/` test runner)
- executed how: import `Logo` (both `variant="light"`/`variant="dark"`) into guest `App.tsx`'s new showcase
  section, `yarn dev:guest`, screenshot against `Components.html`'s Logo section
- risk: none

### R3 — `Button` (M)
- files: `web/shared/components/Button.tsx` (new — `variant: primary|secondary|outline|ghost|danger|icon`,
  `size: lg|md|sm`, optional trailing icon slot, `disabled`)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders every variant × size grid (mirrors `Components.html`'s Buttons section);
  `yarn dev:guest`, tab through with keyboard only, confirm visible focus ring on every variant (AC3),
  screenshot
- risk: none

### R4 — `Badge`, `Avatar` (M)
- files: `web/shared/components/Badge.tsx` (new — status-dot variants: confirmed/awaiting/pending/
  cancelled/draft, plus `instant-book`/outline/solid/curated shapes from `Components.html`),
  `web/shared/components/Avatar.tsx` (new — `initials`, optional `ring` boolean for the gold-ring state)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders every badge kind + both avatar states, `yarn dev:guest`, screenshot against
  the Badges section
- risk: `Avatar`'s double ring (`0 0 0 2px white, 0 0 0 4px gold`) isn't a single Tailwind utility — will use
  an explicit `box-shadow` value; flag in PR body as the one spot styling isn't a pure token utility class

### R5 — Form controls: `Input`, `Checkbox`, `Radio`, `Switch`, `Tabs` (L)
- files: `web/shared/components/Input.tsx` (new — `label`, `helperText`, `error?: string`, optional
  `prefix`/`suffix` slots), `web/shared/components/Checkbox.tsx` (new), `web/shared/components/Radio.tsx`
  (new), `web/shared/components/Switch.tsx` (new), `web/shared/components/Tabs.tsx` (new — tab list with
  optional count badge per tab, reuses `Badge`)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders the Form controls grid (default/focus/error/prefix-suffix input states,
  checked/unchecked checkbox+radio, on/off switch, 2-tab `Tabs` with counts); `yarn dev:guest`, keyboard-only
  pass confirming every control is operable and visibly focused (AC3), screenshot
- risk: "focus" state in the mockup is a static screenshot of `:focus` — implemented as real `:focus-visible`
  styling, not a separate prop, so it only shows on real keyboard focus (correct behaviour, mockup can't
  show that distinction)

### R6 — `SearchBar` (hero + compact variant) (M)
- files: `web/shared/components/SearchBar.tsx` (new — `variant: hero|compact`, props for the
  where/check-in/check-out/guests segment values + `onSearch`)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders both variants, `yarn dev:guest`, screenshot against the Search section
- risk: none — purely presentational, no date-picker/autocomplete logic (spec's explicit "out")

### R7 — `Header` (M)
- files: `web/shared/components/Header.tsx` (new — composes `Logo` + `SearchBar variant="compact"` + nav
  actions + `Avatar`, the 2px gold accent line)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders `Header` full-width, `yarn dev:guest`, screenshot against the Header section
- risk: none

### R8 — `PropertyCard`, `BookingCard` (L)
- files: `web/shared/components/PropertyCard.tsx` (new — photo, favorite heart, static dot pager, title,
  rating-or-"New", subtitle, price row), `web/shared/components/BookingCard.tsx` (new — price/night, VAT
  note, check-in/out + guests summary, `Button` CTA, instant-book note, line-item price breakdown, total)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders both cards with the mockup's sample data as story props, `yarn dev:guest`,
  screenshot against the "Property card & booking card" section
- risk: `PropertyCard` needs a placeholder image — mockup uses local SVGs (`marina.svg`, `living.svg` etc.
  under `designs/dss-v1-web-mockups-html/`); component takes an `imageSrc: string` prop, showcase points it
  at a copied SVG under the guest app's own `public/` (not reused from `designs/`, which is reference-only
  per `protected-paths.md`)

### R9 — `Sidebar` (light/dark variant) (M)
- files: `web/shared/components/Sidebar.tsx` (new — `variant: light|dark`, nav item list with icon + label +
  optional count `Badge`, active-item highlight)
- layer: `web/shared/components/`
- test: none
- executed how: showcase renders both variants side by side, `yarn dev:guest`, screenshot against "App
  navigation"
- risk: none

### R10 — Cross-app consumption smoke test + docs (S)
- files: `web/packages/host/src/App.tsx` (change — import `Logo` + one `Button` from
  `web/shared/components`, minimal render, proving the shared path resolves from `host` too, not just
  `guest`), `docs/ARCHITECTURE.md` (change — `web/shared/` row: drop "components/ (reserved, currently
  empty)", list what's actually there now)
- layer: docs + `host/src/App.tsx`
- test: none
- executed how: `(cd web && yarn build:all)` clean for both apps (AC4), `yarn dev:host` opened in browser
  confirming `Logo`+`Button` render there too
- risk: none

## Docs to update in this PR
- [ ] `docs/features/ui-component-library/spec.md` (acceptance criteria checked off)
- [ ] `docs/ARCHITECTURE.md` — `web/shared/` row (R10)
- [ ] `docs/DOMAIN_GLOSSARY.md` — not expected; these are UI/design-system terms, not domain nouns. Skip
      unless a genuinely new domain term shows up while building (none anticipated)
- [ ] `docs/decisions/ADR-007-shared-component-library.md` — new (R1, written before any component lands)

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| Vite doesn't watch/HMR `web/shared/` by default since it's outside each app's project root | Slower dev loop only, not a correctness risk | Confirmed during R1's `yarn dev:guest` — Vite's default `server.fs` allows importing outside root, and file-watching isn't root-restricted; if HMR doesn't pick up edits, note it and fall back to manual restart |
| `web/shared/**` isn't covered by either app's `tsconfig.app.json` `include` (`"include": ["src"]`) | Could typecheck/build-fail or silently skip typechecking shared files | Checked during R1: since `web/shared/` is imported via relative path from inside `src/`, TS's `moduleResolution: "bundler"` follows the import and typechecks it regardless of `include`; if `tsc -b` doesn't pick it up, add `web/shared` to `include` in both `tsconfig.app.json` files (flag as a scope note in the PR if needed, it's a one-line config fix required to make R1 buildable at all) |
| No `web/` test runner exists, so verification for all 10 requirements is build+lint+visual only | A visual regression could ship unnoticed since nothing asserts DOM output | Accepted per `CLAUDE.md`: "`web/` has no test runner... configured yet" — out of scope to add one here; screenshots per requirement are the available evidence |

## Assumptions
- The user's explicit instruction this session ("put components into `web/shared/component`") is the human
  decision to revisit ADR-006 now — recorded as ADR-007 in R1, not silently overridden.
- `web/shared/theme.css` should be byte-identical to `designs/dss-theme.css` (no divergence) — it's already
  written as a ready-to-use Tailwind v4 theme file, not a mockup-only artifact.
- The guest app's `App.tsx` becoming a full component showcase (rather than a throwaway demo removed at the
  end) is intentional and stays after this PR — it's the only real-browser verification surface available
  until real guest screens exist, and it doubles as a living reference during upcoming screen work. If that's
  wrong and it should be deleted/replaced once screens land, that's a follow-up, not blocking this PR.
- No new runtime dependency is needed — everything here is React + Tailwind classes + inline SVG, all
  already installed (rule C2).
