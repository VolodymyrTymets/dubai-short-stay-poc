# Domain glossary

> One meaning per term. This drives naming in code, database and UI copy.
> A new user-facing noun means a line here, in the same PR (rule E1).

| Term (client language) | Code identifier | Means exactly | Not to be confused with |
|------------------------|-----------------|---------------|--------------------------|
| Guest | `Guest` (`api/prisma/models/actors.prisma`) | A person who books stays; a 1:1 extension of `Account` (`accountId` is unique). | Historically `AccountService.createCustomerAccount`/a `Customers` relation name lingered as leftovers from before the schema was renamed `Customer` → `Guest` (see the old `Customer`/`Order` tables in `api/prisma/migrations/20260822074028_init/migration.sql`) — this crashed every e2e test's `DataCooker.beforeAll()` (`InitCustomerMigration` called `this.prisma.customer`, a model that no longer exists) and was fixed in `property-listing-schema` (`AccountService.createGuestAccount`, the `Guest` relation, `AccountRoleType.GUEST`). File/class names containing "customer" (`init.customer.migration.ts`, `InitCustomerMigration`, `assets/customers.ts`) were left as-is — cosmetic only, not a functional trap. |
| Host | `Host` (`api/prisma/models/actors.prisma`) | A person who lists properties for guests to book; same 1:1-with-`Account` shape as `Guest`. | — |
| Account | `Account` | The single login identity shared by every role (guest, host, admin). Holds no profile/contact data itself. | `AccountProfile` (contact/personal data) and `AccountIdentity` (auth secrets) — both separate 1:1 tables. |
| Account role | `AccountRoleType` enum: `GUEST`, `HOST`, `ADMIN`; joined via `AccountOnRole` | The role(s) an `Account` currently holds — one account can hold more than one role over time. `Account.lastAccountRoleId` caches the most recently used one. | `Guest`/`Host` — those are actor profile tables, not the role assignment itself. |
| Account profile | `AccountProfile` | Contact and personal details (email, phone, name, DOB, SSN, avatar) plus `isPhoneVerified`/`is18YearOld` flags. | `AccountIdentity` — that holds password/OTP hashes and the refresh token, not personal data. |
| File | `File` + `FileType` (`IMG`, `VIDEO`) + `FileStatus` (`FILE_STATUS_*`) | An uploaded asset (e.g. an avatar or listing photo) stored in S3, tracked through an upload-progress state machine. | — |
| Deleted (soft delete) | `deleted: Boolean` on most models | Rows are soft-deleted (`deleted = true`), never hard-deleted, so history and relations survive. `DeletedHistory` records deletions separately. | An actual `DELETE` — never issue one against these tables. |
| Property | `Property` (`api/prisma/models/property.prisma`) | The "Home" listing a `Host` publishes for guests to book — SRS v8.4 §B.0. `ownerId` points at `Host.id`; catalog refs (amenities, accessibility, area, city) are FKs, not raw values. | `Property` will later have sibling product lines `Experience`/`Service` (SRS §B.1-B.2, not yet built) — those are provider-led, not host-owned. |
| Owner | `Host` + `HostProfile` (`api/prisma/models/host-profile.prisma`) | The SRS's `Owner` entity (§B.12) — same actor as `Host`, extended with KYC status, bank account and tax residency via the additive `HostProfile` table. Not a separate identity. | `HostKycDocument` — the individual uploaded documents (passport, Emirates ID, etc.), not the profile itself. |
| RatePlan | `RatePlan` (`api/prisma/models/property.prisma`) | The pricing structure attached 1:1 to a `Property` (base rate, seasonal/length-of-stay/occupancy rule sets) — SRS §B.23. | `TDFRateSchedule`/`CommissionSchedule` (SRS §B.50-51, admin-config, not yet built) — those set the *rates DSS charges*, not a single property's price. |
| Area / City / POI | `Area`, `City`, `Poi` (`api/prisma/models/catalog.prisma`) | Geographic catalog a `Property` locates itself against — SRS §B.4/§B.5/§B.7. `City` is the top-level container; `Area` belongs to a `City`; `Poi` (landmark/beach/mall/dining) belongs to a `City` and optionally an `Area`. | — |
| Amenity / Accessibility feature | `AmenityCatalog`, `AccessibilityFeature` (`api/prisma/models/catalog.prisma`) | Read-only reference data (48 amenities, 16 accessibility features per the locked SRS catalogs, §B.6/§B.8) that a `Property` tags itself with via `PropertyAmenity`/`PropertyAccessibility` join tables. | — |
| DET permit | `Property.detPermitNumber` (SRS §B.12) | The Department of Economy and Tourism permit number a `Property` must hold — a free-text string on the model, entered by the `Host` at listing creation but only *enforced* (must be non-null) at the `DRAFT` → `LIVE` transition (`property.service.ts`'s locked rule). No permit classification, expiry date or uploaded document field exists yet — those are SRS mockup concepts not yet modelled. | `HostKycDocument` — that verifies the *owner's* identity, not the *property's* regulatory permit. |
| Tourism Dirham Fee (TDF) | `Property.tdfPerBedroom` (SRS §B.50, resolved rate) | The per-bedroom, per-night AED fee a `Property` charges guests on behalf of DET — stored as a plain nullable `Int` on `Property`, set directly by the `Host` today (no admin-config `TDFRateSchedule` lookup exists yet, so this is the resolved rate, not a formula). Collection/remittance itself (the actual charge and payout to DET) is not implemented — no `Booking`/`Payment` model exists yet. | `RatePlan` — that is the property's own nightly price, not the DET-bound fee layered on top of it. |

## Naming rules that follow from the above
- New code says **Guest**, never "Customer" — `Customer` is dead terminology from the pre-rename schema.
- A `Host` and a `Guest` are both just an `Account` wearing a role; don't create a parallel identity concept for either.

## Status/enum vocabularies
| Enum | Values | Meaning of each |
|------|--------|-----------------|
| `AccountRoleType` | `GUEST`, `HOST`, `ADMIN` | Who the account currently acts as. |
| `FileType` | `IMG`, `VIDEO` | The media kind of an uploaded `File`. |
| `FileStatus` | `FILE_STATUS_CREATED`, `FILE_STATUS_UPLOAD_IN_PROGRESS`, `FILE_STATUS_UPLOAD_COMPLETED`, `FILE_STATUS_UPLOAD_FAILED` | Where an upload is in its lifecycle. |
| `PropertyStatus` | `DRAFT`, `PENDING_REVIEW`, `LIVE`, `PAUSED`, `ARCHIVED` | A `Property`'s listing lifecycle (SRS §B.0). `LIVE` requires the owner's `HostProfile.kycStatus` to be `VERIFIED` with a verified bank account (locked rule, SRS §B.12). |
| `PropertyType` | `APARTMENT`, `VILLA`, `TOWNHOUSE`, `PENTHOUSE` | The physical type of a `Property`. |
| `CancellationPolicy` | `FLEXIBLE`, `MODERATE`, `STRICT` | A `Property`'s booking cancellation terms. |
| `KycStatus` | `PENDING`, `VERIFIED`, `REJECTED` | Verification state of a `HostProfile` or an individual `HostKycDocument`. |
| `HostKycDocumentType` | `PASSPORT`, `EMIRATES_ID`, `TRADE_LICENSE`, `TITLE_DEED`, `EJARI`, `NOC`, `POA` | The 7 document types a `HostKycDocument` can be (SRS §B.12). |
| `PoiType` | `LANDMARK`, `BEACH`, `MALL`, `DINING` | The kind of point of interest a `Poi` represents. |
| `AmenityCategory` | `ESSENTIALS`, `LIVING`, `KITCHEN`, `OUTDOOR`, `SAFETY`, `PREMIUM` | The 6 categories the 48 locked `AmenityCatalog` entries fall into (SRS §B.6). |
| `AccessibilityCategory` | `MOBILITY`, `SENSORY`, `COMMUNICATION`, `COGNITIVE` | The 4 categories the 16 locked `AccessibilityFeature` entries fall into (SRS §B.8). |

`Property` and `RatePlan` now exist (see the table above). Booking/transactional terms (`Booking`,
`Payment`, `Refund`, `Review`, `DisputeCase`, etc., visible in `doc/designs/` mockup names like
`TripDetail.html`, `HostEarnings.html`) don't exist in the Prisma schema yet — add them here the moment
the migration that introduces them lands (see `docs/features/property-listing-schema/spec.md`'s
out-of-scope list for the planned phasing).
