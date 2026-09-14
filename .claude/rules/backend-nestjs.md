---
description: NestJS-specific mechanics on top of backend-core - modules, DI, ValidationPipe, exception filters, guards, interceptors, Swagger, testing module.
paths:
  - "api/nest-cli.json"
  - "**/*.module.ts"
  - "**/*.controller.ts"
  - "**/*.guard.ts"
  - "**/*.interceptor.ts"
  - "**/*.filter.ts"
  - "**/*.pipe.ts"
  - "**/*.decorator.ts"
  - "**/main.ts"
---

# NestJS mechanics

Read `backend-core.md` first — this file only adds what is specific to Nest.

1. **DI only.** No `new SomeService()`, no module-level mutable singletons, no service locator. Constructor injection with an interface/token where the dependency crosses a feature boundary.
2. **Module boundaries are the public API.** A feature module exports only what siblings may use. Importing a provider from another feature's internal file is a violation even if TypeScript allows it.
3. **Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`**, registered in `main.ts`. Without `whitelist` extra fields flow silently into your DTO.
4. Request/response DTOs are classes with `class-validator` decorators. Never bind `@Body() body: any` or the raw `Request`.
5. **Serialization**: response DTOs plus `ClassSerializerInterceptor`/`@Exclude()` — never return the ORM entity (core rule 6).
6. **One global exception filter** maps domain errors to HTTP. Services never import or throw `HttpException` (core rule 8).
7. Config via `@nestjs/config` with a validated schema (zod/joi) and `ConfigService` injection.
8. **Guards** carry authorization; a public route needs an explicit `@Public()` decorator so "public" is visible in the diff. Ownership checks stay in the service (core rule 17).
9. Interceptors are for cross-cutting concerns (logging, serialization, timeouts) — never for business logic.
10. Request-scoped providers only with a stated reason: they disable Nest's singleton optimisation and are a common performance surprise.
11. **Swagger decorators kept in sync** with the DTOs — they are the OpenAPI source of truth (see `api-rest.md` and the `api-contract` skill).
12. Tests: `Test.createTestingModule` with the repository provider overridden; e2e through the real app with `supertest`, pipes and guards active.
13. Layout per feature: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.repository.ts`, `dto/`, `<feature>.errors.ts`, specs beside the code — unless this repo already does it differently (rule D2).
