# guest-home-search — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — guest-home-search -->
Approved-by: volodymyr · 2026-09-15

Pattern followed: `web/shared/api/auth/query.ts` + `account-avatar`'s `Account.tsx` for the gql-operation →
codegen → hook → component shape; `web/shared/components/PropertyCard.tsx` and `SearchBar.tsx` (already
pixel-matched to both mockups per ADR-007) for the presentation layer; `web/packages/guest/src/router.tsx` +
`Layout.tsx` (`web-page-layout` ticket) for routing/shell. No new shared component is needed — `PropertyCard`,
`SearchBar`, `Badge`'s `CuratedBadge`, and `icons.tsx` already cover both mockups' card/search chrome.

## Contract changes
- boundary: none. `api/src/property/property.resolver.ts`'s `properties` query, `PropertyEntity`, and
  `PaginationInput`/`SearchInput` already exist, are public (no `@UseGuards`), and are unchanged.
- data: none.
- generated output: `web/shared/api/generated.graphql.tsx` (gitignored) regenerates via `(cd web && yarn
  codegen)` once R1 adds the new operation — needs `api/`'s dev server running (`yarn start:dev`) per the
  standing RUNBOOK requirement.

## Requirements (ordered, each independently verifiable)

### R1 — `Properties` query operation + generated hook (S)
- files: `web/shared/api/property/query.ts` (new — `PROPERTIES_QUERY`, `query Properties($pagination:
  PaginationInput, $search: SearchInput) { properties(pagination: $pagination, search: $search) { id slug
  title propertyType bedrooms bathrooms maxGuests basePriceAed cleaningFeeAed currency rating reviewCount
  description photos { id } } }`)
- layer: web shared API layer, mirrors `shared/api/auth/query.ts`
- test: none (`web/` has no test runner)
- executed how: `(cd api && yarn start:dev)`, then `(cd web && yarn codegen)`; confirm `usePropertiesQuery`
  is emitted into `web/shared/api/generated.graphql.tsx`
- risk: none

### R2 — Shared `Property` → `PropertyCard` mapper (S)
- files: `web/shared/api/property/mapPropertyToCard.ts` (new) — pure function taking one `Properties` query
  row, returning `PropertyCardProps` (minus `onToggleFavorite`/`isFavorited`, which the page wires). Encodes
  the mocked-field table from `spec.md`: placeholder image, description-derived subtitle, "Studio" for
  `bedrooms === 0`, 3-night illustrative total via `Intl.NumberFormat('en-AE', { style: 'currency', currency:
  'AED', maximumFractionDigits: 0 })`, no `favoriteBadge`.
- layer: shared web logic (used by both R3 and R4 — satisfies `frontend-react.md` rule 9's "used twice" bar
  for extraction)
- test: none (no test runner; this is why it's kept as one small pure function, spot-checked visually via R3)
- executed how: exercised indirectly through R3/R4's browser checks
- risk: description-derived subtitle can look awkward for very short/long descriptions — acceptable per
  spec.md's edge-case table; not a blocker

### R3 — `HomePage` (M)
- files: `web/packages/guest/src/pages/HomePage.tsx` (replace stub)
- layer: web page (`guest`)
- behaviour: hero (eyebrow/heading/subheading text from `Main.html`, `<SearchBar variant="hero">` with
  static placeholder segment values, static area-chip row using `Badge`), Hand-picked section calling
  `usePropertiesQuery({ variables: { pagination: { take: 8, orderBy: [...] } } })` → maps each row through
  R2 into a `PropertyCard` grid with the four states (loading: skeleton/`animate-pulse` tiles per
  `frontend-react.md` rule 7; empty: "No stays yet" message; error: message + retry button calling
  `refetch()`; success: the grid), "Show all N stays" button (`Link` to `/search`), the static "Why
  DubaiShortStay" 3-card section, the static "List your property" CTA banner. Area guides section
  (`Main.html` lines 33–38) is not built (explicit skip).
- test: none (no test runner)
- executed how: `yarn dev:guest`, open `/`, screenshot the loading and success states against the real,
  auto-seeded data (`api/src/migrations/items.development/init.property.migration.ts` creates 100
  `Property` rows, most `LIVE`, on `yarn start:dev`'s first boot against an empty DB — no manual seeding
  needed). Screenshot the error state by stopping the API mid-session and reloading. Screenshot the empty
  state by temporarily forcing zero results client-side (e.g. a throwaway `take: 0`) rather than truncating
  the seeded table (rule C4 — no destructive DB command for a screenshot)
- risk: none — seed data removes the empty-state risk this plan originally (incorrectly) assumed

### R4 — `SearchResultsPage` + route (M)
- files: `web/packages/guest/src/pages/SearchResultsPage.tsx` (new), `web/packages/guest/src/router.tsx`
  (add `{ path: 'search', Component: SearchResultsPage }` under the existing `Layout`)
- layer: web page (`guest`) + routing
- behaviour: static filter-pill bar (Price/Property type/Bedrooms/Instant Book/Self check-in/Amenities/
  Accessibility — non-interactive, per spec.md's explicit out-of-scope), results header (`"{n} stays"` from
  the live query's result length + static "Recommended" sort control), 3-column grid via the same
  `usePropertiesQuery` + R2 mapper with the same four states as R3, static pagination row (decorative — no
  total-count field exists server-side to paginate against). Map panel (`SearchResults.html` lines 123–137)
  is not built (explicit skip).
- test: none (no test runner)
- executed how: `yarn dev:guest`, navigate to `/search` directly and via R5's links, screenshot all four
  query states
- risk: none beyond R3's

### R5 — Wire navigation to `/search` (S)
- files: `web/packages/guest/src/pages/HomePage.tsx` (hero "Search" button + "Show all N stays" button →
  `useNavigate()`/`Link` to `/search`), `web/packages/guest/src/Layout.tsx` (pass `onSearch={() =>
  navigate('/search')}` to the existing `Header`, using `useNavigate()`)
- layer: web page + shell
- test: none
- executed how: `yarn dev:guest`, click all three entry points from `/`, confirm each lands on `/search`
- risk: none

## Docs to update in this PR
- [ ] `docs/features/guest-home-search/spec.md` — acceptance criteria checked off
- [ ] `docs/ARCHITECTURE.md` — replace the `HomePage`-is-a-stub note with the real page description, add the
  new `/search` route and `SearchResultsPage`, and record the mocked-field decisions (placeholder image,
  description-derived subtitle, illustrative 3-night total, no curation badge, decorative filters/sort/
  pagination) as a landmine so a later ticket knows what's still fake

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| `description`-derived subtitle looks off for real host copy | Cosmetic only, not a functional break | Accept for this ticket; flagged in spec.md's mocked-field table for a human to revisit once real subtitle data exists |
| Seeded properties cycle through all `PropertyStatus` values (`DRAFT`/`PAUSED`/`PENDING_REVIEW` included) | Could leak non-`LIVE` listings into the guest-facing grid | None — verified in-session: `PropertyService.findAllProperties` (`api/src/property/property.service.ts:256-266`) already filters `status: PropertyStatus.LIVE, deleted: false`, so this is a non-issue |
| Reusing `Header`'s already-static compact `SearchBar` on `/search` doesn't match `SearchResults.html`'s header (which shows real selected filters "Dubai Marina · 12–15 Oct · 2 guests") | Header looks generic instead of reflecting the active search | Accepted — wiring real header state needs the same missing filter/date model as the rest of search; out of scope per spec.md |

## Assumptions
- `PropertyCard`, `SearchBar`, `Badge`/`CuratedBadge`, and `icons.tsx` need no changes — verified against
  both mockups during planning; they already match pixel values (card width/height, gaps, radii).
- Both pages fetch `take: 8`; `/search` does not request more just because it's a "full" results page,
  since the query cannot report a total count to paginate against anyway (see the pagination risk above).
- No new runtime dependency — `Intl.NumberFormat` is a browser built-in, not a package (rule C2, AC6).
