# property-listing-schema — Property/Listing domain schema (SRS adaptation, phase 1 of N)

## Problem
The Prisma schema (`api/prisma/models/`) only has `Account`/`Guest`/`Host`/`File` — none of the
marketplace domain from `doc/DSS-SRS-v9.pdf` (Property, Booking, Payment, Review, …) exists yet. The
SRS locks 28 commerce entities across the whole booking lifecycle; that is too large for one PR. This
plan covers **phase 1 only**: the Property/Listing side (what a Host lists), adapted onto the existing
Account/Guest/Host system without changing it.

## Goal / business value
Business Model ranked goal #1 — "get an end-to-end guest booking flow **and host listing flow**
working" — the host listing flow is the half of that goal this phase unblocks. It also seeds the
catalog/reference data (`City`, `Area`, amenities, accessibility) every later phase (Booking, Search,
Review) will join against.

## Scope
- in:
  - Reference/catalog Prisma models: `City` (§B.7), `Area` (§B.4), `Poi` (§B.5), `AmenityCatalog`
    (§B.6, 48 locked items), `AccessibilityFeature` (§B.8, 16 locked items).
  - `HostProfile` + `HostKycDocument` — additive 1:1/1:many extensions hung off the existing `Host`
    table, covering the SRS `Owner` entity (§B.12: KYC status, bank account, tax residency).
  - `Property` (§B.0) — the Home listing entity, adapted to reference `Host.id` as owner.
  - `PropertyAmenity` / `PropertyAccessibility` join tables (mirroring the existing `AccountOnRole`
    join-table pattern) instead of raw ID arrays.
  - `PropertyPhoto` join table reusing the existing `File` entity for gallery images instead of a new
    asset concept.
  - `RatePlan` (§B.23) — 1:1 pricing structure per `Property`.
  - Minimal GraphQL surface: `Query.property(id)`, `Query.myProperties(pagination, sorting, search)`,
    `Mutation.createProperty`, `Mutation.updateProperty` — host-owned only, `draft` status by default.
- **out (explicit):**
  - Everything transactional: `Booking`, `Payment`, `Refund`, `BookingModification`, `DisputeCase`,
    `PayoutBatch` (SRS §B.9–B.11, B.15–B.17) — phase 2.
  - `Review` (§B.14) — phase 3, depends on `Booking`.
  - `Experience`/`Service`/`Provider` (§B.1–B.3) — the two secondary product lines; phase 4.
  - `Wishlist`, `PromoCode`/`Discount`, `PricingRule`, `EmailTemplate`, `CorporateAccount` (§B.19–B.29)
    — growth/ops features, phase 5+.
  - `InsurancePolicy`/`Claim` (§B.30–B.31) — SRS itself marks these **PROVISIONAL** pending a business
    decision (§0.2 "E1 strategic decision"); out until that lands (Business Model non-negotiable: no
    improvised money logic).
  - Long-stay entities `B.33`–`B.36` — decommissioned in SRS v8.3 itself, never build them.
  - `TDFRateSchedule`/`CommissionSchedule`/`ChannelDistribution` (§B.50–B.52, admin-config) and all
    "platform-ops" entities (§B.37+: BlogPost, Campaign, ABTest, IncidentReport, …) — not commerce,
    not needed for the listing flow.
  - Full KYC document-review workflow (upload → moderation queue) — `HostKycDocument` stores a status
    enum only; the review pipeline is a separate future ticket.
  - Any `web/` screen — `guest`/`host` are still scaffold-stage (per `ARCHITECTURE.md`); wiring a
    listing-creation screen is a separate `react-feature` ticket once this API surface exists.
  - Address-disclosure-until-booking-confirmed logic on `Property.address_disclosed` — depends on
    `Booking` (phase 2); phase 1 always discloses the address to the owner and admin only.

## Acceptance criteria
- [x] AC1 The 5 catalog models exist, migrated, with the locked reference counts documented (48
      amenities' categories, 16 accessibility categories) even though seed rows are a follow-up.
- [x] AC2 A `Host` can have a `HostProfile` (KYC status, bank account, tax residency) without any
      existing field on `Account`/`AccountProfile`/`AccountIdentity`/`Host`/`Guest` changing — only a
      new additive back-relation field appears on `Host`.
- [x] AC3 `Property` persists every field from SRS §B.0 relevant to phase-1 scope (identity, content,
      capacity, location, pricing snapshot fields owned by Property itself, catalog refs, owner ref,
      cancellation policy, curation, lifecycle) with `ownerId` pointing at `Host.id`.
- [x] AC4 `RatePlan` persists the pricing structure from SRS §B.23, 1:1 with `Property`.
- [x] AC5 A host account can call `createProperty` then `updateProperty` then `myProperties` via a real
      GraphQL request against the running dev server and see the row change; a non-owner cannot fetch
      another host's non-live property. Verified via curl against `yarn start:dev` — see the R3-R5
      commit message for the full sequence, including the KYC-gate rejection and success paths.
- [x] AC6 `api/schema.gql` regenerates cleanly; the existing `AccountEntity`/`FileEntity`/auth
      operations in it are byte-for-byte unchanged. Verified: `git diff api/schema.gql` shows only
      additive hunks.
- [x] AC7 `docs/DOMAIN_GLOSSARY.md` gains rows for every new user-facing term (Property, Host operating
      as Owner, RatePlan, Area, City, POI, Amenity, Accessibility feature).

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Property `status: live` but `Host.HostProfile.kycStatus != verified` | Rejected at the service layer (locked SRS rule §B.12) | SRS §B.12 locked rule |
| `updateProperty` called by an account that is not the property's owner or an admin | `FORBIDDEN` GraphQL error, no data leak | api-graphql.md rule 9 (field/op-level authz) |
| `myProperties` pagination/sorting/search | Uses `common/input/{pagination,sorting,search}.input.ts`, not the legacy `pagination.service.ts` collection-string pattern | Project rule (legacy pattern frozen) |
| Property amenities/accessibility list is empty | Valid — arrays, not required | SRS §B.0 (no min stated) |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | "Keep the account system unchanged" — does that forbid even an additive back-relation field (e.g. `Properties Property[]`) on `Host`, which Prisma requires for a valid relation? | Additive-only fields on `Host`/`Guest` are allowed (no existing field/behavior/GraphQL type changes); a same-named field is never removed or retyped. | Yes — confirm before implementing, since the literal instruction says "completely unchanged." |
| 2 | RatePlan's seasonal/LOS/occupancy pricing rule arrays — normalized child tables or `Json` columns? | `Json` columns (matches how the SRS itself frames these as admin-editable rule sets, e.g. `TDFRateSchedule`); revisit if reporting/querying on individual rules is needed later. | No — reversible, low-risk default. |
| 3 | Ticket ID — no tracker exists yet (per CLAUDE.md project rules) | Use the slug `property-listing-schema` for the branch/docs folder instead of a `DSS-<n>` ID. | No — matches the documented interim convention. |
