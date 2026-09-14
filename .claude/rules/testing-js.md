---
description: JS/TS testing mechanics on top of the core testing rules - runners, transport-level tests per framework, React and React Native patterns, GraphQL operation tests.
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/__tests__/**"
  - "e2e/**"
  - "**/maestro/**"
  - "**/playwright.config.*"
  - "**/jest.config.*"
  - "**/vitest.config.*"
---

# JS/TS testing mechanics

Core `testing.md` decides *what* to test and at which level. This file is *how*, in this ecosystem.

## Backend, by framework

1. **NestJS** — `Test.createTestingModule` with the repository provider overridden for unit tests; e2e through the real app with `supertest`, pipes and guards active.
2. **Express** — `supertest(app)` against the **exported app object**. Never start a listening server in a test: it leaks ports and makes the suite order-dependent.
3. **Fastify** — `app.inject({ method, url, payload })`. No port binding, and it exercises the route schemas, which is half the value of the test.
4. Integration tests run against a real disposable database (docker/testcontainers), never a mocked ORM.

## GraphQL

5. Test **operations**, not resolver functions: execute the real document against the schema so the resolver map, the loaders and the schema all take part.
6. Every new relation field gets a test that asserts the **query count** (or a loader spy) — this is the only cheap way to keep an N+1 from coming back.
7. Assert on `extensions.code`, never on the error message text.

## React

8. React Testing Library with `user-event`, querying by accessible role or label. No whole-tree snapshots.
9. Cover the four states of any data-driven view; wrap in the real providers through one shared `renderWithProviders` helper.
10. Mock at the network boundary (MSW or the project's equivalent), not the data-layer hooks — mocking the hook tests nothing about the wiring.

## React Native

11. RNTL for components; mock native modules at the module boundary; assert navigation **params**, not navigation internals.
12. A component test cannot prove a screen mounts on a device — critical flows go to the device e2e tool (mobile rule 4).

## Determinism

13. Fake timers for anything time-dependent; seeded data; no `waitFor` with a fixed delay — wait for a condition. `jest.retryTimes` and re-running until green are rule B3 violations.
