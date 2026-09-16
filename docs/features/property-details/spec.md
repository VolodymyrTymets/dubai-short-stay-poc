# property-details — guest property detail page

## Problem
A `Guest` can browse `Property` listings on `HomePage` and `SearchResultsPage` (`guest-home-search`), but
clicking a `PropertyCard` does nothing — there is no page to land on and no way to see a single listing's
full details. `api/`'s only single-property query (`property(id)`) is authenticated and scoped to the
owning `Host`, so guests have no way to fetch one listing at all.

## Goal / business value
Serves ranked goal #1 (`docs/BUSINESS_MODEL.md`): completes the next step of the guest browsing flow
(home/search → detail) end to end, even if several sections of the design mockup are rough or static,
rather than gold-plating what already exists.

## Scope
- in:
  - A new public, unauthenticated GraphQL query, `propertyBySlug(slug: String!)`, returning one `LIVE`,
    non-deleted `PropertyEntity` or `null` — the guest-facing counterpart to the existing owner-scoped
    `property(id)` query, following the same public-query convention as `properties` (no `@UseGuards`).
  - A new `PropertyDetailPage` (`web/packages/guest/src/pages/PropertyDetailPage.tsx`) at route
    `/property/:slug`, built to `designs/dss-v1-web-mockups-html/PropertyDetail.html` for the sections
    backed by real data (see the mocked/omitted-section table below).
  - Wiring: `PropertyCard` (used by both `HomePage` and `SearchResultsPage` via the shared
    `PropertyResultsGrid`) navigates to `/property/:slug` on click.
  - The four required view states (`frontend-react.md` rule 7): loading, error (retry), empty
    (unknown/non-live slug — same UI, both are "nothing to show"), success.
- **out (explicit):**
  - Any interactive booking: date picker, calendar, guest counter, "Reserve" flow. `docs/DOMAIN_GLOSSARY.md`
    confirms no `Booking` model exists yet, and `BUSINESS_MODEL.md`'s non-negotiables forbid fabricated
    payment/payout logic — the price summary card renders real price fields but "Reserve" is a disabled,
    non-functional button.
  - Individual reviews, per-category rating bars ("Cleanliness 4.9", …) — no `Review` model exists yet
    (`DOMAIN_GLOSSARY.md`). Only the real aggregate `rating`/`reviewCount` already on `PropertyEntity` are
    shown.
  - The "Where you'll be" map/POI-distance section — no `Poi` query is exposed over GraphQL yet and no map
    library is installed (`C2` forbids adding a runtime dependency without approval).
  - Named amenity/accessibility chips ("Sea view", "Fast Wi-Fi · 300 Mbps", …) — `PropertyEntity` only
    exposes raw `amenityIds`/`accessibilityIds`; no GraphQL query resolves `AmenityCatalog`/
    `AccessibilityFeature` labels yet. Shown as a real count only ("8 amenities included"). A follow-up
    ticket should add a small public catalog query once a screen needs the actual labels.
  - "Hosted by <name>" with a real host name — no field on `PropertyEntity`/`Host` is exposed for this.
    Shown as static copy ("Hosted by a DubaiShortStay host").
  - The "Where you'll sleep" per-bedroom gallery — `Property.beds` is a flat `{type, count}[]`, not
    per-bedroom, so there is no per-bedroom data to render.
  - The "Things to know" house-rules/stay-details grid — mostly generic mockup copy not backed by any
    field; only `cancellationPolicy` (a real enum already on `PropertyEntity`) is surfaced, as a single line
    near the price card.
  - Real listing photos — same known gap as `guest-home-search` (`PropertyPhotoEntity` has no public URL).
    Gallery renders the same flat placeholder tile, once per real photo (min 1), matching
    `mapPropertyToCard`'s existing convention.
  - Decorative badges ("Dubai Favorite", "Deluxe Holiday Home") — not backed by any field; replaced with
    the real `propertyType` enum value as the one badge shown.
  - Any change to `web/packages/host` — this ticket is guest-only.

## Acceptance criteria
- [x] AC1 Given a `LIVE` property's slug, when a guest opens `/property/<slug>`, then the page renders
      title, badges (propertyType), guest/bedroom/bathroom/bed counts, rating+reviewCount, description,
      highlights (Instant Book / DET-licensed, each conditionally on real fields), amenity/accessibility
      counts, cancellation policy, and a price summary card, all from `propertyBySlug`.
- [x] AC2 Given an unknown slug or a non-`LIVE`/deleted property's slug, when a guest opens
      `/property/<slug>`, then the page shows the same "not found" empty state (not a raw GraphQL error).
- [x] AC3 Given a network/server error, when `propertyBySlug` fails, then the page shows an error state
      with a retry action.
- [x] AC4 Given `HomePage` or `SearchResultsPage`, when a guest clicks a `PropertyCard`, then the browser
      navigates to that property's `/property/:slug` (client-side, no full reload).
- [x] AC5 `propertyBySlug` never returns a `DRAFT`/`PENDING_REVIEW`/`PAUSED`/`ARCHIVED`/deleted property,
      even when its slug is guessed — same visibility rule as the existing `properties` query.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Slug belongs to a `DRAFT`/`PAUSED`/`ARCHIVED`/deleted property | `propertyBySlug` returns `null`; page shows "not found" | AC2, AC5 — same rule `findAllProperties` already applies |
| `cleaningFeeAed` is `null` | Price card omits the cleaning-fee line | existing nullable field, same as `mapPropertyToCard` |
| `detPermitNumber` is `null` | "DET-licensed" highlight is omitted, not shown with a blank permit | field is nullable on `PropertyEntity` |
| `reviewCount` is 0 | Show "New" instead of a rating, matching `PropertyCard`'s existing `MIN_REVIEWS_FOR_RATING` convention | reuse existing convention |
| Zero photos | Render exactly 1 placeholder tile, matching `mapPropertyToCard` | existing convention |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | Route param: `id` or `slug`? | `slug` — already fetched by the existing `properties` list query, human-readable, and `Property.slug` is already unique | No |
| 2 | New query name, since `property` is taken by the owner-scoped query | `propertyBySlug(slug: String!)` | No |
| 3 | Build the amenity/accessibility catalog + host-name GraphQL exposure now, or defer? | Defer (see out-of-scope) — each is a small new module/join on its own and this ticket is already three requirements; goal #1 favours shipping the flow over gold-plating one screen | No, flagged for a follow-up ticket in the PR body |
