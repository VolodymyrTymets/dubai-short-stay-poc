# create-property — Host property creation page

## Problem
A `Host` has no way, from the `host` web app, to create a `Property` listing. The `createProperty`
GraphQL mutation exists (`api/src/property/property.resolver.ts`) but nothing in `web/packages/host/`
calls it — `host`'s only pages today are `Home` (empty stub), `Sign In` and `Sign Up`.

## Goal / business value
Serves ranked goal #1 in `docs/BUSINESS_MODEL.md` — get an end-to-end host listing flow working, even
rough, over polishing any single screen. This is the first step of the host listing flow (a `Property`
row reaching `status: DRAFT`).

## Scope
- in:
  - One new page in `web/packages/host/` — `CreatePropertyPage` — with sections for Basics, Location,
    Pricing, and DET & compliance, styled with `web/shared/components/` and Tailwind tokens per
    `web/shared/theme.css` (not a pixel copy of the raw mockup HTML/CSS).
  - A `createProperty` GraphQL mutation document under `web/shared/api/property/`, codegen'd into a
    typed `useCreatePropertyMutation` hook, following the `auth/mutations.ts` precedent.
  - Real form fields for every field `CreatePropertyInput` accepts that this page covers: `slug`
    (auto-derived from `title`, editable), `title`, `description`, `propertyType`, `bedrooms`,
    `bathrooms`, `maxGuests`, a single `beds` entry (`type` + `count`), `areaId`, `cityId`, `lat`,
    `lng`, `basePriceAed`, `cleaningFeeAed` (optional), `isInstantBook`, `detPermitNumber` (optional),
    `tdfPerBedroom` (optional).
  - A route (`/listings/new`) and wiring the existing "Listings" sidebar nav item to it, so the page is
    reachable from the app shell (today that item has no route — see `Layout.tsx`'s existing TODO).
  - Inline success state (new property id/slug/status) and inline GraphQL-error display on the same
    page — no navigation to a listings-index page, since none exists yet.
- **out (explicit):**
  - The other 7 wizard steps shown in the `HostCompliance.html` mockup's left rail (Basics/Location/
    Photos/Amenities/Pricing/Availability/Booking & policies as separate pages) — this ticket ships one
    combined creation page instead (see the plan's scope decision).
  - DET permit **classification** radio group, the derived "AED 30 per night" TDF badge, permit
    **expiry date**, and permit **document upload** — none of these have a backing field on `Property`
    (only `detPermitNumber` and `tdfPerBedroom` exist), and fabricating a fee-calculation UI around a
    money-adjacent field the schema doesn't support would violate the `BUSINESS_MODEL.md` non-negotiable
    against fabricated payment/fee logic. `tdfPerBedroom` is captured as a plain "AED per bedroom per
    night" number input instead.
  - The mockup's "Ready to publish" checklist sidebar (KYC/bank/photos/pricing checks) — those all read
    state a brand-new draft can't have yet (no photos, no rate plan) and belong to an edit/review screen,
    not creation.
  - The "Property size" chip row — redundant with the `bedrooms` field already collected in Basics.
  - Editing an existing property (`updateProperty`), amenities/accessibility selection, photo upload,
    availability, booking policies, `cancellationPolicy` selection (server defaults it to `MODERATE`
    when omitted, per `property.service.ts`).
  - A catalog query for `Area`/`City` — none exists yet in the API. `areaId`/`cityId` are plain text
    inputs (a host pastes a known id, e.g. from seed data) — explicit product-decision tradeoff, not an
    oversight.
  - Adding `react-hook-form`/`zod`: `CLAUDE.md` says to default to them "when the first form ships", but
    the actual first form (`web/shared/components/AuthCard.tsx`) already shipped as a plain
    `useState`-controlled form with no such library installed. Per rule D2 (repo convention over generic
    best practice) and rule C2 (no new runtime dependency without approval), this page follows
    `AuthCard`'s existing controlled-input pattern instead — recorded as a settled decision in
    `docs/decisions/ADR-009-hand-rolled-web-forms.md`.
  - A Tourism Dirham Fee **authorisation checkbox** — present in the originally approved plan (AC4 below,
    as first shipped), then dropped after self-review: the reviewer noted a required, legally-worded
    consent statement ("I authorise DubaiShortStay to collect and remit the Tourism Dirham Fee on my
    behalf") with no backing field anywhere records that a host ever checked it, which is the same
    fabricated-money-adjacent-UI problem that got the classification/expiry/upload/derived-fee-badge
    fields cut above — a human decided to drop the checkbox entirely rather than soften its wording,
    pending a real `tdfAuthorizedAt`-style field before any such gate ships again.

## Acceptance criteria
- [x] AC1 Given a signed-in host, when they click "Listings" in the sidebar, then they land on
      `/listings/new` and see the Basics/Location/Pricing/DET & compliance sections.
- [x] AC2 Given all required fields filled with valid values, when the host clicks Save, then a real
      `createProperty` mutation fires with those values and, on success, the page shows the new
      property's `id`, `slug` and `status` (`DRAFT`) inline.
- [x] AC3 Given the server returns a GraphQL error (e.g. duplicate slug, invalid `areaId`/`cityId` FK),
      when Save is clicked, then the raw error message is shown inline near the form, the form keeps its
      entered values, and Save can be retried without a page reload.
- [x] ~~AC4 Given the "I authorise DubaiShortStay to collect the Tourism Dirham Fee" checkbox is
      unchecked, when Save is clicked, then submission is blocked client-side with an inline message —
      this is a UI-only gate (no schema field backs it), not sent to the server.~~ **Dropped after
      self-review** — see this file's out-of-scope section. The checkbox was removed entirely rather than
      implemented; no authorisation gate exists on this page.
- [x] AC5 Given the Discard button, when clicked, then the form is not submitted and the host is
      navigated back to `/`.
- [x] AC6 Given a `slug` that doesn't match `^[a-z0-9]+(-[a-z0-9]+)*$` or exceeds 80 characters, when
      Save is clicked, then a client-side validation message blocks submission before any network call.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Title changes after slug was auto-derived and hand-edited | Stop auto-deriving once the host has typed into the slug field directly (a `touched` flag) | This spec |
| `beds` row left with type filled but count 0, or count filled but type empty | Client-side validation blocks submit (mirrors `PropertyBedInput`'s `@IsString`/`@Min(1)`) | `api/src/property/dto/property-bed.input.ts` |
| `lat`/`lng` out of range | Client-side validation blocks submit (mirrors `@Min(-90)/@Max(90)` and `@Min(-180)/@Max(180)`) | `api/src/property/dto/create-property.input.ts` |
| Mutation succeeds but the host immediately navigates away | No draft-recovery — a fresh visit to `/listings/new` starts a blank form | This spec (POC-stage, no autosave) |
| Not signed in / no HOST role | `GqlAuthGuard`/`RoleGuard` reject server-side with `UNAUTHENTICATED`/`FORBIDDEN`; shown via the same inline error path as AC3 | `api/src/property/property.resolver.ts` |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|--------------------|----------------|
| 1 | Single combined creation page vs. full 8-step wizard vs. DET-only page with stubbed core fields | Single combined page | Asked — human chose "Single all-in-one form" |
| 2 | How to source `areaId`/`cityId` without a catalog query | Plain text ID inputs | Asked — human chose "Plain text ID inputs" |
