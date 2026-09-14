---
description: Backend rules that hold whatever the framework is - NestJS, Express or Fastify - and whatever the API style is. Layering, transport isolation, validation boundary, errors, transactions, queries, auth, logging, jobs.
paths:
  - "api/src/**"
  - "**/*.service.ts"
  - "**/*.usecase.ts"
  - "**/*.repository.ts"
---

# Backend rules (framework-agnostic)

These hold for NestJS, Express and Fastify alike. The framework file next to this one adds mechanics; it never overrides these.

## Transport isolation (the rule the others depend on)

1. **Business logic must not know how it was called.** No `req`, `res`, `reply`, `next`, GraphQL `context`, `Request`, `HttpException` or status code below the transport layer. A use case takes plain typed arguments and returns plain data or throws a domain error. *Why: this is the whole reason the same use case can serve a REST route, a GraphQL resolver and a queue consumer — and the reason it is testable without a server.*
2. **Layering:** transport (controller / route handler / plugin / resolver) → use case or service → repository → data source. Skipping a layer needs an ADR.
3. The transport layer is thin: parse input, call one use case, map the result. If a handler is longer than ~15 lines, logic has leaked into it.
4. Feature boundaries: a feature may import another feature only through its public entry point, never a sibling's internals. Shared code moves to `libs/`/`packages/`.

## Input and output boundary

5. **Every input is parsed into a typed shape at the boundary** before it reaches a use case — zod/TypeBox/class-validator, whatever the repo uses. Unknown fields are rejected, not forwarded. Never pass a raw body object inwards.
6. **Never return a persistence entity to the outside.** Map to an explicit response shape. Never leak `passwordHash`, internal IDs, soft-delete flags, audit columns or other users' data.
7. Config is validated once at boot and injected. `process.env` appears only in the bootstrap/config module (monorepo rule 2 applies to the Node version, this one to everything else).

## Errors and async

8. Use cases throw **domain errors** (`CartEmptyError`, `OrderAlreadyShippedError`). The mapping to a transport response happens in exactly **one** place per app.
9. Errors are never swallowed. No empty `catch`, no `catch { return null }` without a logged reason (rule D5).
10. **No floating promises.** Every promise is awaited or explicitly handled; no `async` callback passed to `forEach`. An unhandled rejection in Node is a crash or a silently hung request depending on the framework — neither is acceptable.

## Data

11. **Multi-write operations run in one transaction**, and the transaction boundary lives in the use case — not in the repository, not in the handler.
12. Every list is **paginated** with explicit field selection and a stable sort. No unbounded list, anywhere, including internal endpoints.
13. A query inside a loop is an **N+1 bug**, not a style issue. Batch it.
14. Raw SQL requires a `// WHY:` and bound parameters. String-concatenated SQL is a security defect.
15. Schema changes ship as forward migrations with a rollback note; applied migration files are immutable; migrations run against local databases only (rules C3, C5). See the `db-migration` skill.

## Security

16. Authentication by default: a publicly reachable operation is an explicit, visible exception.
17. Authorization at the boundary **and** ownership re-checked in the use case. *Why: a guard knows the caller is authenticated; only the use case knows whether record 42 belongs to them.*
18. Never trust a client-supplied ID, filter, sort field or include for authorization or for building a query — allowlist them.

## Operations

19. Structured logging with a request/correlation ID that survives across layers. No `console.log`. No tokens, passwords, full request bodies or PII in logs (rule D8).
20. Background jobs are idempotent, retried with backoff, and have a dead-letter path. No business-critical work in `setTimeout`.
21. Graceful shutdown on SIGTERM: stop accepting, drain in-flight work, close the pool.

## Tests

22. Use case unit tests with the repository mocked; integration tests through the **real transport** against a real disposable database (docker/testcontainers). Never mock the ORM in an integration test.

## Verification (rule B1)

A backend change is done only when the operation was **actually called** — an HTTP request, a GraphQL operation, or an integration test that goes through the transport — with the real status/response captured in the evidence block. A passing unit test is not verification of an endpoint.
