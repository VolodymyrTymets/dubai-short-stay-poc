# property-listing-schema — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     Approved-by: -->
Approved-by: volodymyr · 2026-09-14 — approved in chat: "You can add back relation fields to account
system if it need. The rest is fine you can implement" (answers open questions #1 and #2 in spec.md)

Pattern followed: `api/src/files/` (module split: `<module>.module.ts` / `.resolver.ts` / `.service.ts`,
`entities/`, `dto/`, optional `services/`) and `AccountOnRole` (`api/prisma/models/account.prisma`) as
the join-table precedent for many-to-many catalog refs. No existing precedent for a paginated,
owner-scoped list query outside the frozen `pagination.service.ts` — R5 introduces the first typed one.

## Contract changes
- data: 4 new Prisma migrations (catalog, HostProfile/HostKycDocument, Property + join tables, RatePlan)
  via `yarn prisma-migrate`; `yarn prisma-gen` after each. All additive — no column on an existing table
  is altered, dropped or renamed. `Host` gains one new back-relation array field (`Properties`).
- boundary: `api/schema.gql` gains `PropertyEntity`, `RatePlanEntity`, `Query.property`,
  `Query.myProperties`, `Mutation.createProperty`, `Mutation.updateProperty`. Every existing type/field/
  operation in `schema.gql` stays byte-identical (AC6).
- generated output: `api/generated/prisma/**` and `api/schema.gql` regenerate from the dev server;
  neither is hand-edited (rule S3). No `web/` consumer exists yet, so no `yarn codegen` run this PR
  (nothing to regenerate against).

## Requirements (ordered, each independently verifiable)

### R1 — Catalog reference models (S)
- files: `api/prisma/models/catalog.prisma` (new: `City`, `Area`, `Poi`, `AmenityCatalog`,
  `AccessibilityFeature`, each with `id`, `deleted`, `createdAt`/`updatedAt` per the repo's standard
  shape); migration under `api/prisma/migrations/`.
- layer: data (Prisma).
- test: `api/test/**/catalog.e2e-spec.ts` (or unit against PGlite via `DataCooker`) — create one row per
  model, read it back.
- executed how: `yarn prisma-migrate` run against local Postgres+PostGIS, output captured; `yarn test`
  green.
- rollback: drop the 5 new tables — no existing data affected, purely additive.
- risk: none — no FK into existing tables yet.

### R2 — `HostProfile` + `HostKycDocument` (S)
- files: `api/prisma/models/actors.prisma` (change: add `HostProfile HostProfile?` back-relation field
  to `Host` — no existing field touched); `api/prisma/models/host-profile.prisma` (new).
  `HostKycDocument.fileId` references the existing `File` model (reuse, not duplicate).
- layer: data.
- test: e2e — create a `Host`, attach a `HostProfile`, attach two `HostKycDocument` rows, assert
  `kycStatus` default is `pending`.
- executed how: `yarn prisma-migrate` + the test above; diff `api/prisma/models/account.prisma` in the
  PR to prove it has zero changes (only `actors.prisma` gains the one back-relation line).
- rollback: drop `HostProfile`/`HostKycDocument` and the one back-relation field on `Host` — no existing
  data affected.
- risk: this is the "unchanged account system" boundary (spec open question #1) — do not proceed past
  this requirement without the human answer.

### R3 — `Property` + amenity/accessibility/photo joins (L)
- files: `api/prisma/models/property.prisma` (new: `Property`, `PropertyAmenity`, `PropertyAccessibility`,
  `PropertyPhoto`); `actors.prisma` (change: add `Properties Property[]` back-relation to `Host`, same
  additive rule as R2); `catalog.prisma`/`files.prisma` (change: back-relation fields only).
- layer: data. Fields per SRS §B.0: identity/status/slug, content, capacity, location (`areaId`,
  `cityId`, `lat`, `lng`, `addressDisclosed` — always `true` for now per spec out-of-scope), pricing
  (`basePriceAed`, `cleaningFeeAed`, `currency`, `isInstantBook`), catalog refs via the join tables,
  regulatory (`detPermitNumber`, `tdfPerBedroom`), owner ref (`ownerId → Host.id`,
  `commissionPct`), cancellation policy, curation (`activeBadges` as `Json`, `qualityScore`), read-only
  performance fields (`rating`, `reviewCount`, `bookingsTotal` — start at `null`/`0`, no writer yet since
  `Review`/`Booking` don't exist), lifecycle timestamps.
- test: e2e — create `Host` + `HostProfile(kycStatus: verified)` + bank account, create a `Property`
  through the service, assert the locked rule "cannot reach `status: live` without verified owner KYC +
  bank" (spec edge case 1) both succeeds and rejects; a second case asserts an empty
  `amenityIds`/`accessibilityIds` array on create is valid (spec edge case 4).
- executed how: `yarn prisma-migrate`; the test above; `yarn test -- property`.
- rollback: drop `Property`/`PropertyAmenity`/`PropertyAccessibility`/`PropertyPhoto` and the
  `Properties` back-relation on `Host` — no existing data affected.
- risk: 60+ field entity — implement exactly SRS §B.0's fields, nothing speculative (rule C1); the
  performance/read-only fields need no writer this phase since their sources (`Review`, `Booking`) are
  out of scope — leave them `null`/`0` and computed later.

### R4 — `RatePlan` (M)
- files: `api/prisma/models/property.prisma` (add `RatePlan`, 1:1 on `propertyId`).
- layer: data. `seasonalOverrides`, `losDiscounts`, `lastMinuteDiscount`, `occupancyPricing`,
  `channelMarkups` as `Json` per spec open question #2.
- test: e2e — attach a `RatePlan` to a `Property`, round-trip a `seasonalOverrides` array through `Json`.
- executed how: `yarn prisma-migrate`; the test above.
- rollback: drop `RatePlan` — no existing data affected.
- risk: none — 1:1 addition, no consumer yet.

### R5 — GraphQL surface (M)
- files: `api/src/property/` — `property.module.ts`, `property.resolver.ts`, `property.service.ts`,
  `entities/property.entity.ts`, `entities/rate-plan.entity.ts`, `dto/create-property.input.ts`,
  `dto/update-property.input.ts`; register `PropertyModule` in `app.module.ts`.
- layer: resolver (thin, authorize + delegate) → service (business logic, KYC-gate check from R3) →
  Prisma (backend-core rules 1/3). `myProperties` uses `common/input/{pagination,sorting,search}.input.ts`
  directly with a typed Prisma `findMany`/`count` — no `this.prismaService[collection]` (project rule:
  legacy pattern frozen, don't extend). Every relation field on `PropertyEntity` (`owner`→`Host`,
  `area`→`Area`, `city`→`City`, `amenities`, `accessibility`, `photos`→`File`) is backed by a
  request-scoped DataLoader keyed by id, created per-request and attached to GraphQL `context` — same
  place `AuthModule` already puts the authenticated principal (api-graphql.md rule 7, backend-core rule
  13: no per-parent query, no N+1).
- test: `api/src/property/property.resolver.spec.ts` / e2e — owner can create/update/list own
  properties; a second host account gets `FORBIDDEN` reading a non-live property that isn't theirs.
- executed how: real `curl`/GraphQL request against `yarn start:dev` for `createProperty` →
  `updateProperty` → `myProperties`, and one denied cross-owner `property(id)` call — response bodies
  captured for the PR evidence block, per `api-graphql.md`'s verification section. While running
  `myProperties` for a host with 2+ properties each with a relation field selected, watch the SQL log and
  capture the query count (must stay flat, not scale with row count — proves the DataLoader is wired).
  Separately, run `git diff api/schema.gql` after regeneration and confirm every hunk is additive — no
  line inside the pre-existing `AccountEntity`/`FileEntity`/auth types changes (AC6).
- rollback: n/a (code only, no migration in this requirement).
- risk: none new — reuses the existing JWT auth guard/context pattern from `AuthModule`.

## Docs to update in this PR
- [ ] `docs/features/property-listing-schema/spec.md` (acceptance criteria checked off)
- [ ] `docs/ARCHITECTURE.md` — new `api/src/property` module row; new models in "Where data truth lives"
- [ ] `docs/DOMAIN_GLOSSARY.md` — Property, Owner (= `Host` + `HostProfile`), RatePlan, Area, City, POI,
      Amenity, Accessibility feature
- [ ] `docs/decisions/ADR-007-property-domain-schema.md` — records the additive-relation approach onto
      `Host`/`Guest` and the `Json`-vs-normalized call for `RatePlan`

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| "Unchanged account system" read as zero-diff on `actors.prisma`, not just zero-diff on existing fields | Blocks R2/R3 entirely, needs a redesign (e.g. a side table with no back-relation, losing type-safe Prisma navigation) | Ask before R2 (open question #1) |
| `Property` §B.0 has fields this plan mis-scoped out (only skimmed the SRS code block, not a byte-exact transcription) | A second migration sooner than planned | Re-read SRS §B.0 verbatim field-by-field during R3 implementation, before writing the Prisma model |
| KYC-gate rule (R3) needs `HostProfile.kycStatus`/bank fields from R2 to be right | R3 blocked or reworked | R2 lands and is tested first; R3 starts only after R2 is green |

## Assumptions
- No ticket tracker exists; branch is `chore/property-listing-schema`, this folder name is the ticket ID.
- Catalog seed data (48 amenities, 16 accessibility features, Dubai's areas) is a follow-up data-loading
  task, not part of this schema PR.
- `PostGIS` stays unused for now — `lat`/`lng` are plain `Float` columns per the SRS's own Property type,
  not a `geography` column; adopting PostGIS geometry is a separate decision if area/proximity search
  needs it (phase 4+ per SRS §0.2).
- `Property.photos`/`amenities`/`accessibility` GraphQL sub-fields stay unpaginated (api-graphql.md rule
  8 is about unbounded lists) — they're bounded by catalog size (≤48 amenities, ≤16 accessibility
  features) and realistic gallery size, so no `first`/`limit` is added for phase 1.
