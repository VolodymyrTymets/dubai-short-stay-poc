# ADR-002 — GraphQL (NestJS + Apollo, code-first) as the API style

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
The API needs to serve two different frontends (guest and host apps) with overlapping but distinct data
needs per screen. A single leftover `@Controller()` (`api/src/app.controller.ts`) exists from Nest's default
scaffold but carries no real API surface.

## Decision
Use `@nestjs/graphql` with the Apollo Driver, code-first (schema auto-generated to `api/schema.gql`).
Resolvers live at `api/src/<Module>/<Module>.resolver.ts`; queries return `Entity` types mirroring the
Prisma models, mutations take `Input` types — see `api/.claude/skills/api-conventions`.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| REST | Would need more bespoke endpoints per screen/frontend; GraphQL's field selection fits two frontends with different data needs better |
| Schema-first GraphQL | Code-first chosen so TypeScript types and the schema can't drift silently |

## Consequences
- Positive: `web/`'s two apps can each request exactly what they need; codegen keeps client and server types in sync.
- Accepted cost: needs discipline around N+1 (DataLoader), pagination and depth limits as the schema grows — not all enforced yet (no depth/cost limit configured as of this ADR).
- Follow-ups: add a query depth/cost limit and disable introspection before any public/production deploy (see `api-graphql.md` rules 12–13).

## Revisit when
A depth/cost limit or persisted-query allowlist is needed before a production launch.
