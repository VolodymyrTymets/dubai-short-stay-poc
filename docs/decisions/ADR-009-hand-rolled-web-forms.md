# ADR-009 — Hand-roll web form state with `useState` until a form library is adopted

- **Date:** 2026-09-16
- **Status:** accepted
- **Deciders:** volodymyr (repo owner)
- **Ticket:** create-property

## Context
`.claude/rules/frontend-react.md` rule 8 says: "Forms use react-hook-form + zod resolver (no form
library is installed yet — add it when the first form ships), don't hand-roll validation." In practice,
the repo's actual first form — `web/shared/components/AuthCard.tsx`, consumed by both apps'
`SignInPage`/`SignUpPage` — already shipped as a plain `useState`-controlled form with hand-rolled
validation, and neither `react-hook-form` nor `zod` was ever added. The rule's condition ("when the first
form ships") already fired without the library being introduced.

This surfaced again while planning `create-property`'s host "Create Property" page — a form with more
fields than `AuthCard`. The `/analyze` gate flagged the conflict between the written rule and the actual
precedent rather than letting the plan silently pick one, per this repo's rule that a plan/constitution
conflict is a human escalation, not something an agent resolves unilaterally.

## Decision
Follow `AuthCard`'s actual precedent: hand-roll form state with `useState`, and hand-roll validation
mirroring the corresponding backend DTO's `class-validator` constraints (see
`web/packages/host/src/pages/createPropertyForm.ts`'s `validate()`, which comments the DTO file it
mirrors). Do not add `react-hook-form`/`zod` as part of a feature PR — introducing a new runtime
dependency needs its own explicit approval (rule C2), separate from any single feature.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| Add `react-hook-form` + `zod` now, in the `create-property` PR, to finally satisfy rule 8 | Rule C2 requires new-dependency approval to be explicit and considered on its own, not bundled into an unrelated feature PR; it would also leave `AuthCard` as an inconsistent, unconverted form in the same codebase. |
| Add the library but only to new forms going forward, leaving `AuthCard` as-is | Two form patterns living side by side is worse than one consistent (if non-ideal) pattern — the next contributor has no way to know which one a new form should follow. |

## Consequences
- Positive: one consistent form pattern across the codebase today; no new dependency risk taken on
  inside a feature PR.
- Accepted cost: hand-rolled validation duplicates each DTO's constraints by hand, with no compile-time
  link between the two — a DTO change needs someone to remember to update the mirroring `validate()`
  function. No `web/` test runner exists yet (per `CLAUDE.md`) to catch drift automatically.
- Follow-ups: `.claude/rules/frontend-react.md` rule 8's wording ("no form library is installed yet — add
  it when the first form ships") is now stale against actual practice and should be corrected in a
  dedicated rules PR, not silently reworded inside a feature PR (`.claude/rules/**` is an ask-first
  protected path).

## Revisit when
A form is proposed with validation complex enough that hand-rolling it becomes error-prone (nested/
repeatable field groups, cross-field validation, async validation) — at that point, evaluate adding
`react-hook-form` + `zod` repo-wide as its own decision, converting `AuthCard` and every hand-rolled form
in the same PR rather than leaving a mixed pattern.
