# guest-home-search — guest home page + search results page

## Problem
`guest`'s `HomePage` is still the stub left by `web-page-layout` (`return null`, with a `TODO(volodymyr,
web-page-layout): guest home / search landing screen`). There is no landing page and no search-results
page anywhere in `guest` — a visitor hitting `/` sees a blank body under the header/footer, and there is
nowhere for a "Search"/"Show all stays" click to go. The backend already exposes a public, unauthenticated
`properties` query (`api/src/property/property.resolver.ts`) — "Public search of live property listings,
paginated... no authentication required" — but no web operation or page consumes it yet.

## Goal / business value
Serves ranked goal #1 (`docs/BUSINESS_MODEL.md`): gets a real, end-to-end guest browsing flow (home →
hand-picked listings → search results) working, even if rough, rather than polishing a single screen. Also
closes a stub left by a prior ticket.

## Scope
- in:
  - `HomePage` (`web/packages/guest/src/pages/HomePage.tsx`) built to `designs/dss-v1-web-mockups-html/
    Main.html`: hero (eyebrow, heading, subheading, hero search bar, area chip row), a "Hand-picked" grid
    backed by the real `properties` query, the static "Why DubaiShortStay" 3-card section, and the static
    "List your property" CTA banner.
  - A new `SearchResultsPage` (`web/packages/guest/src/pages/SearchResultsPage.tsx`) at route `/search`,
    built to `designs/dss-v1-web-mockups-html/SearchResults.html`: filter-pill bar, results header
    (count + sort control), a 3-column `properties`-backed grid, and a pagination row — all minus the map
    panel (explicitly asked to skip).
  - A new shared GraphQL query operation (`web/shared/api/property/query.ts`, a `Properties` query) and its
    codegen'd `usePropertiesQuery` hook.
  - A shared `Property` → `PropertyCard` props mapper (used by both new pages) — see Open question 1.
  - Wiring: the hero's "Search" button, the "Show all N stays" button, and the shared `Header`'s compact
    search icon all navigate to `/search`.
  - `docs/ARCHITECTURE.md` updated to record the new pages/route and the mocked-field decisions below.
- **out (explicit):**
  - The "Area guides" section of `Main.html` (the 6-tile area image grid) — explicitly asked to skip.
  - The map panel of `SearchResults.html` — explicitly asked to skip.
  - Real filtering/sorting behaviour. The `properties` query only takes `search: { slug, title }` +
    pagination — no area/price/bedroom/amenity/instant-book/accessibility filter args exist server-side, and
    no booking/date model exists yet to filter by check-in/out. The filter pills, sort control and pagination
    row render (matching the mockup's layout) but are **decorative/static**, same convention as the existing
    `SearchBar`/`Header` components (already static, not wired to real state) — a follow-up ticket wires
    filtering once the query supports it.
  - Any change to `api/` — the `properties` query, `PropertyEntity` and `PaginationInput`/`SearchInput`
    already exist and are unchanged by this ticket.
  - i18n — both new pages carry hardcoded English copy (headings, section titles, CTAs), same as the
    already-shipped `Header`/`Footer`/`AuthCard`. Flagged per rule D7: no i18n library is installed, and
    `BUSINESS_MODEL.md` explicitly rules out building one speculatively — not silently built past here.
  - Real property photos — `PropertyPhotoEntity` only has `fileId`/`position`/`isHero`, no resolved S3
    `publicUrl` (unlike other file-backed entities), so no photo can be rendered from real data yet. See
    Open question 2 / mocked-field table below.
  - A total booking price — no `Booking`/length-of-stay model exists yet (`docs/DOMAIN_GLOSSARY.md`); the
    mockup's "· AED X total" is a multi-night total the API cannot compute.

## Data the mockup wants that `Property` doesn't have (mocked per instruction)
| Mockup element | Property field used | Gap | This ticket's handling |
|---|---|---|---|
| Card image | none (`PropertyPhotoEntity` exposes `fileId`/`position`/`isHero` only, no URL field) | `FileEntity.publicUrl` *does* exist as a `@ResolveField` (`files.resolver.ts`), but it's driven by real S3 presigning (`S3ManagerService.getPublicUrl(file.key)` against `AWS_S3_BUCKET_NAME`, empty in local `.env`). The dev seed (`api/src/migrations/items.development/init.property.migration.ts`) sets every seeded photo's `File.key` to a bare `picsum.photos` URL, not a real S3 key (its own comment: "no real upload/S3 object behind this yet") — wiring `publicUrl` through today would call S3 signing with a URL-as-key against an empty bucket and produce a broken link, not a working image. That's a pre-existing `FilesModule`/seed-data gap, bigger than this ticket (rule B4) | render a fixed neutral placeholder tile (solid-color, no network image) for every card until that gap is fixed separately |
| Card subtitle (e.g. "Marina Gate 2 · Full sea view") | none | no such field on `Property` | derive from `property.description`, truncated — real content, not fabricated, but not the mockup's building-name style |
| "· AED X total" | none | no length-of-stay/booking model | compute from a fixed illustrative 3-night stay (`basePriceAed * 3 + (cleaningFeeAed ?? 0)`), clearly commented as a placeholder in code |
| "Dubai Favorite" / "Top Home" curation badge | `qualityScore` exists but no documented threshold | SRS doesn't define one | omit the badge for every card (the mockup itself already omits it on some cards, so this is within the design's own variation) |
| Title style ("Apartment in Dubai Marina") | `Property.title` (host-authored, real) | none — real field | use `property.title` as-is |

## Acceptance criteria
- [ ] AC1 Given a visitor on `/`, when the page loads, then the hero, Hand-picked grid and the two static
      sections render per `Main.html` (minus Area guides), using the shared `Header`/`Footer`/`Layout`
      already in place.
- [ ] AC2 Given the `properties` query is loading, loaded with results, loaded with zero results, or errors,
      then the Hand-picked grid shows a loading, success, empty or error (with retry) state respectively —
      per `frontend-react.md` rule 7.
- [ ] AC3 Given a visitor clicks the hero "Search" button, the "Show all N stays" button, or the header's
      compact search control, then they land on `/search`.
- [ ] AC4 Given a visitor on `/search`, when the page loads, then the filter bar, results header, a
      3-column property grid (same data source/mapping as Hand-picked) and a pagination row render per
      `SearchResults.html` minus the map panel — with the same four query states as AC2.
- [ ] AC5 `(cd web && yarn codegen)` (API dev server running) emits `usePropertiesQuery`; `(cd web && yarn
      build:all)` typechecks clean with both pages wired in.
- [ ] AC6 No new runtime dependency is added (rule C2) — formatting uses `Intl.NumberFormat`, already
      available at runtime.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| `properties` returns `[]` | Grid renders an empty state, not a blank section | this plan (rule 7) |
| `properties` query errors (e.g. API down) | Grid renders an error state with a retry action | this plan (rule 7) |
| `property.rating` is `null` | Card shows "New" instead of a star rating (already handled by `PropertyCard`) | existing `PropertyCard` behaviour |
| `property.bedrooms === 0` | Details line reads "Studio" instead of "0 bedrooms", matching the mockup's "Studio · 2 guests" card | this plan |
| `property.description` shorter than the truncation length | Show it in full, no ellipsis | this plan |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | Where should the `Property` → `PropertyCard`-props mapping live, since both new pages need it? | A new `web/shared/api/property/mapPropertyToCard.ts` (shared, since it's used twice — `frontend-react.md` rule 9) | No — rule 9 already answers it |
| 2 | Photos: wire `PropertyPhotoEntity` to the existing `FileEntity.publicUrl` resolver now, or placeholder and defer? | Placeholder and defer — verified in-session that `publicUrl` would resolve incorrectly for every seeded photo today (see the mock table above): the seed's `File.key` is a `picsum.photos` URL, not a real S3 key, and `AWS_S3_BUCKET_NAME` is empty in local `.env`. Fixing that is a `FilesModule`/seed-data change, bigger than this ticket (rule B4) | No — explicit "mock it for now" instruction covers this, now backed by a verified reason rather than an assumption |
| 3 | Should filters/sort/pagination on `/search` be wired to real state even though the API can't filter yet? | No — render the layout, leave interaction static, same convention already used by `SearchBar`/`Header` | No — instruction says skip the map/mockup interactivity is not requested |
