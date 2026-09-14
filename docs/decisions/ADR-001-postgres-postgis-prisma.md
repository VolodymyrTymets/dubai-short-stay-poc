# ADR-001 — Use PostgreSQL + PostGIS via Prisma as the persistence layer

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
The product is a rental marketplace that will eventually need geospatial queries (search by area/location).
A relational store with strong geo support and a typed ORM was needed for the NestJS backend.

## Decision
Use PostgreSQL with the PostGIS extension as the database, accessed through Prisma 7 (`api/prisma/schema.prisma`,
schema split across `api/prisma/models/*.prisma` via `prismaSchemaFolder`). The generated client lives in
`api/generated/prisma/` (gitignored, never hand-edited).

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| MongoDB / a NoSQL store | Weaker relational integrity for account/role/booking data; less mature geo tooling than PostGIS for this use case |
| TypeORM | Team chose Prisma's generated client + migration workflow instead |

## Consequences
- Positive: strong typing end-to-end from schema to resolvers; PostGIS ready for location features without a later migration.
- Accepted cost: an extra adapter layer (`api/prisma.config.ts`, `prisma.adapter.factory.ts`) to swap Postgres for PGlite in tests.
- Follow-ups: no geospatial queries are implemented yet — PostGIS is enabled but unused.

## Revisit when
A geospatial feature is actually built, to confirm PostGIS covers the required query patterns (radius search, polygons, etc.).
