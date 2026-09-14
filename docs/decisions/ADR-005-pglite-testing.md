# ADR-005 — Test against a real database via in-memory PGlite, not a mocked ORM

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
Mocking Prisma in unit tests would let a test pass while the real query is broken; a real Postgres via
Docker/testcontainers is correct but slow to boot per test run and needs infra in CI.

## Decision
Use `@electric-sql/pglite` (in-memory Postgres, with the PostGIS extension via
`@electric-sql/pglite-postgis`) as the test database, wired through `api/prisma.config.ts`'s
environment-aware adapter and `DataCooker` (`api/test/utils/DataCooker/DataCooker.ts`), which runs real
migrations before each suite. Both `yarn test` (unit) and `yarn test:e2e` use this — neither needs Docker
or a running Postgres/Redis.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| Mocked Prisma client | Tests would pass against wrong queries; violates `testing.md` rule 3 |
| Testcontainers / real Docker Postgres per suite | Slower, needs Docker in every environment including CI; PGlite gives the same real-SQL guarantees in-process |

## Consequences
- Positive: fast, real-database-backed tests runnable anywhere Node runs, no Docker dependency for `yarn test`/`yarn test:e2e`.
- Accepted cost: PGlite is not identical to production Postgres in every extension/behaviour — a genuinely Postgres-specific bug could theoretically slip through.
- Follow-ups: none currently known.

## Revisit when
A PGlite/Postgres behavioural mismatch is actually found.
