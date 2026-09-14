# ADR-007 — Adapt the SRS Property/Owner domain onto the existing Account/Host system additively

- **Date:** 2026-09-14
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** property-listing-schema (phase 1 of the SRS-to-Prisma schema migration)

## Context
`doc/DSS-SRS-v9.pdf` (v8.4) locks 28 commerce entities for the DubaiShortStay marketplace, none of which
exist yet in `api/prisma/models/`. The repo's account system (`Account`, `AccountRole`, `AccountOnRole`,
`AccountIdentity`, `AccountProfile`, `Guest`, `Host`) was required to stay unchanged. Two design questions
had to be settled before any of the SRS's Property/Owner entities could be built: (1) whether "unchanged"
permits Prisma's required opposite-relation fields, and (2) whether `RatePlan`'s admin-editable pricing
rule sets (seasonal overrides, length-of-stay discounts, etc.) get their own tables or stay `Json`.

## Decision
1. **Additive-only relations onto the account system.** New domain models (`HostProfile`, `Property`, …)
   add a back-relation field to `Account`/`Guest`/`Host` only when Prisma requires one for referential
   validity (e.g. `Host.Properties Property[]`, `Account.Guest Guest?`). No existing field on
   `Account`/`AccountProfile`/`AccountIdentity`/`Guest`/`Host` is removed, renamed, retyped, or has its
   behavior changed; `api/schema.gql`'s existing types/operations stay byte-identical. The SRS's `Owner`
   entity (§B.12) is `Host` + a new `HostProfile` (KYC, bank, tax), not a parallel identity table.
   **Note (self-review correction):** "additive" describes the account-system *models*, not every
   migration file this ticket generated — the first migration also squashes in pre-existing, unrelated
   schema drift (27 legacy tables and an `AccountRoleType` enum shape that predate this repo's current
   domain, never previously migrated). See `docs/features/property-listing-schema/plan.md`'s Contract
   changes section for the full explanation; that drift is not part of this decision.
2. **`RatePlan`'s rule-set fields are `Json`, not normalized tables**, matching how the SRS itself frames
   these as admin-editable rule sets (e.g. `TDFRateSchedule`). No GraphQL surface exposes them yet since
   no JSON scalar dependency is installed (rule C2 — no new runtime dependency without approval).
3. **Cross-module relation fields (owner, area, city, amenities, accessibility) are exposed as scalar IDs
   on `PropertyEntity`, not nested object types**, for this phase — `Host`/`Area`/`City` have no public
   GraphQL entity of their own yet. This sidesteps the N+1/DataLoader requirement (`api-graphql.md` rule
   7) entirely rather than deferring it: there is no per-parent relation query to batch.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| Zero-diff account Prisma files (no back-relation fields at all) | Not possible — Prisma requires both sides of a relation to be declared, or `prisma generate`/`migrate` fails validation |
| A parallel `Owner` identity table separate from `Host` | Duplicates the actor concept `DOMAIN_GLOSSARY.md` already forbids ("a Host and a Guest are both just an Account wearing a role") |
| Normalized child tables for every `RatePlan` rule set | More upfront schema work for rules with no query/reporting need yet; reversible later if that need appears |
| Nested `Host`/`Area`/`City` GraphQL objects on `Property` now, with DataLoaders | Requires building 3 more GraphQL entities/modules not in this ticket's scope; premature before any consumer needs nested data |

## Consequences
- Positive: every future phase (Booking, Payment, Review, …) can follow the same additive-relation
  pattern without re-litigating whether it's allowed.
- Accepted cost: `Property`'s `ownerId`/`areaId`/`cityId`/`amenityIds`/`accessibilityIds` are opaque IDs
  to GraphQL clients until `Host`/`Area`/`City`/catalog entities get their own public surface — a client
  must issue follow-up queries once those exist.
- Follow-ups: add a JSON GraphQL scalar (with approval) when `RatePlan` needs a write surface; add
  `Host`/`Area`/`City` GraphQL entities + DataLoaders when a consumer needs nested `Property` relations
  (e.g. a guest-facing search/listing screen).

## Revisit when
A `web/` screen needs nested `Property.owner`/`Property.area`/`Property.city` data, or `RatePlan` needs
mutations — both are the signal to add the missing GraphQL entities/scalar rather than opaque IDs.
