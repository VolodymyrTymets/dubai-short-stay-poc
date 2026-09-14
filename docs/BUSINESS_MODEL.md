# Business model

> Why this product exists. This file is the **tie-breaker** the agent uses when two technically valid options collide.
> Goals must be **ranked** — an unranked list gives no way to decide.

## What this product is
Dubai Short Stay is a two-sided short-term rental marketplace (Airbnb-style) for the Dubai market, connecting
**Guests** who book stays with **Hosts** who list properties. Currently a POC: a NestJS/GraphQL backend and
two scaffolded React SPAs (guest-facing and host-facing), building toward the flows described in
`doc/DSS-SRS-v9 2.pdf` and the mockups in `doc/designs/` (search, property detail, checkout, host listings/
calendar/pricing, admin review/compliance/payouts).

## Ranked goals
1. **Validate the concept fast** — get an end-to-end guest booking flow and host listing flow working, even
   if rough, over polishing any single screen or hardening every edge case.
2. **Keep the two sides (guest/host) and admin trust-and-safety flows (KYC, listing review, disputes)
   functionally correct** once built — a POC that mishandles a booking or a payout is worse than a POC
   that does less.
3. **Reuse across `guest` and `host`** — anything genuinely shared (design tokens, the Apollo client, domain
   types) goes in `web/shared/` rather than being duplicated, so the two apps don't drift.

## Non-negotiables (never trade these for speed)
- No fabricated payment or payout logic — money-related flows (`CheckoutPayment`, `HostEarnings`,
  `AdminPayouts` in the mockups) need an explicit, reviewed design before real logic ships, not an
  improvised placeholder.
- No PII (phone numbers, identity documents for `AdminKyc`) in logs or committed fixtures.
- Nothing touches a real production environment or real user data — there isn't one yet, and this stays
  local/staging-only until a human explicitly stands one up (rule C5).

## Explicitly out of scope (this phase)
- i18n/localization — no library installed; don't build a translation layer speculatively.
- Real payment processing, KYC verification integration, or SMS delivery beyond the existing log/notifier
  strategy — stub or mock these until a provider decision is made (ADR required first).
- Mobile apps — this POC is web-only (two Vite SPAs); no React Native code should appear without a decision
  to add that platform.

## Judgement examples
| Situation | Decide this way | Because |
|-----------|-----------------|---------|
| Polish a screen vs. wiring the next flow end-to-end | Wire the next flow | Goal #1 — validating the concept beats a polished dead end |
| Duplicate a small piece of UI in `guest` and `host` vs. extracting it to `web/shared/` immediately | Duplicate once, extract on the second real use | Matches `frontend-react.md` rule 9 and goal #3 — premature sharing before the shape is proven costs more than a short duplication |
| A booking/payout calculation is ambiguous in the SRS | Stop and ask, don't guess | Non-negotiable — money logic isn't improvised |

## Soft values
POC-stage tone: pragmatic and fast over enterprise-polished, but the trust-and-safety and money-adjacent
surfaces (KYC, disputes, payouts) should read and behave carefully even in early versions, since they're
what would make or break user trust in a rental marketplace.
