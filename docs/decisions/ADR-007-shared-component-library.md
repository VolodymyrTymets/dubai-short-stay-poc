# ADR-007 — Build `web/shared/components/` now, superseding ADR-006's "wait for a second use"

- **Date:** 2026-09-14
- **Status:** accepted
- **Deciders:** repo owner (volodymyr), approved on the `ui-component-library` plan
- **Ticket:** ui-component-library (no ticket tracker exists yet — see `CLAUDE.md`'s ticket-convention note)

## Context
ADR-006 established `guest` and `host` as two independent Vite/React SPAs sharing only `web/shared/`, and
explicitly rejected building a shared component library from day one: *"Nothing has been built twice
yet — premature per `frontend-react.md` rule 9; `web/shared/components/` is reserved but empty,"* with its
"Revisit when" condition being *"the same non-trivial component is built twice."* `BUSINESS_MODEL.md`'s
judgement-example table makes the same call for UI specifically: duplicate a small piece of UI once, extract
only on the second real use.

Neither condition has technically been met — `guest`/`host` are still scaffold-stage (`App.tsx` is a
placeholder in both). But `designs/dss-v1-web-mockups-html/Components.html` is a complete, already-decided
design system: every primitive (buttons, form controls, badges, cards, header, nav) is fully specified with
exact tokens, states and variants, reused across dozens of other mockups (`SearchResults.html`,
`HostListings.html`, `AdminQueue.html`, etc.) in `designs/dss-v1-web-mockups-html/`. The repo owner asked,
explicitly, for these to be built as shared React components in `web/shared/components/` now, ahead of any
individual screen.

## Decision
Build the full `Components.html` component set in `web/shared/components/` now, rather than waiting for the
first real duplication in `guest`/`host`. This supersedes ADR-006's "wait for a second use" rejection and
the matching `BUSINESS_MODEL.md` example **for pre-specified design-system primitives with a locked visual
spec** — it does not generally license premature abstraction elsewhere in the codebase; `frontend-react.md`
rule 9 ("don't extract until used twice or ~150 lines") still governs any other component.

The distinction: ADR-006/rule 9 guard against guessing a shared shape from one call site and getting it
wrong. Here there is no guessing — `Components.html` already fixes every variant, size, state and token
these components need, decided once for all of `guest`/`host`/admin before either app has real screens.
Building it once now, matching a locked spec, carries the premature-abstraction risk that rule 9 exists to
avoid; building it per-screen and reconciling three divergent `Button`s later does not remove that risk, it
just defers discovering it.

## Rejected alternatives
| Alternative | Why not | 
|-------------|---------|
| Wait for the first real screen in `guest` or `host` to need a `Button`/`Input`/etc., per ADR-006's original condition | Every upcoming screen plan (per the mockups) needs most of these primitives immediately; waiting means the first 2-3 screens each hand-roll their own, then a reconciliation pass — more total work than building the already-specified set once |
| Build components inline per-app first, promote to `web/shared/` on the second duplication (ADR-006's literal trigger) | Same cost as above, and risks `guest`/`host` drifting on tokens/spacing before the promotion happens — directly against `BUSINESS_MODEL.md` goal #3 |

## Consequences
- Positive: every upcoming `guest`/`host` screen plan can consume a ready primitive set instead of
  reinventing one; tokens/spacing/accessibility behaviour is consistent from the first real screen onward.
- Accepted cost: some of these components (e.g. `PropertyCard`, `Sidebar`) may turn out not to match what a
  real screen needs exactly once one is built — those get adjusted then, not treated as sacred because they
  shipped first.
- Follow-ups: `web/packages/guest/src/App.tsx` becomes a temporary component showcase (the only real-browser
  verification surface available before real screens exist) — see the `ui-component-library` plan's
  Assumptions. It should be replaced by real guest screens once those land, not kept as permanent scaffolding.
- **Flagged (rule D7), not fixed:** several components carry hardcoded English default copy (`BookingCard`'s
  "night"/"Check-in"/"Checkout"/"Guests"/"Total"/"Reserve", `SearchBar`'s "Search", `PropertyCard`'s "New",
  `Badge`'s "Instant Book", `Header`'s "List your property"). `BUSINESS_MODEL.md` explicitly rules out
  building an i18n layer speculatively, so these are left as plain strings rather than turned into a
  half-built prop-per-label scheme — D7 says flag this before it ships, not silently build past it, which
  this note does. When i18n is adopted, these are the extraction points.

## Revisit when
A real screen build reveals one of these components' locked shape is wrong for actual data/behaviour needs
(e.g. `PropertyCard` needs a real image-loading state, `SearchBar` needs real autocomplete) — adjust the
component then, and don't treat "it shipped in the design-system PR" as a reason to keep an unfit shape.
