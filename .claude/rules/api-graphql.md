---
description: GraphQL API rules - schema as a versionless contract, DataLoader against N+1, mandatory pagination, depth and cost limits, field-level authorization, generated types, error masking.
paths:
  - "**/*.graphql"
  - "**/*.gql"
  - "**/*.resolver.ts"
  - "**/*.resolvers.ts"
  - "**/schema/**"
  - "**/typeDefs/**"
  - "**/graphql/**"
---

# GraphQL API rules

## The schema is the contract

1. The schema is the product's public API and it is **versionless**: you cannot ship "v2" to a mobile app already in the store. Design it, review it, and treat every change as permanent.
2. **Fields are deprecated, never removed** while any client might still request them: `@deprecated(reason: "use X, removal after 2027-01")`. Removal is a separate, dated task after the metrics show zero use.
3. Nullability is a design decision, not a default. Mark a field non-null only when it can never legitimately be absent — **a non-null field that resolves to an error nulls out its entire parent object**, so an over-eager `!` turns one bad row into an empty screen.
4. Mutations model **one user intent** each and return a payload type (never a bare `Boolean`), including the mutated entity so the client cache can update itself.
5. Expected, actionable failures belong **in the schema** (a result union or an `errors` field on the payload), not in the top-level `errors` array. Reserve thrown errors for the genuinely exceptional.

## Resolvers

6. **Resolvers are thin**: authorize, then delegate to a use case. No business logic, no ORM calls in a resolver body (backend-core rules 1 and 3).
7. **DataLoader — or the framework's batching equivalent — is mandatory for every relation field.** A relation resolver that queries per parent is an N+1 *by construction*: one query for 50 items becomes 51. Loaders are created **per request** and live on `context`; a process-global loader is a cross-request data leak.
8. **Every list field is paginated** — Relay connections, or an explicit `first`/`limit` with an enforced maximum. An unbounded list field is a denial-of-service waiting for one curious client (core rule 12).
9. **Authorization is per field, not per operation.** `User.email` needs its own check even when the caller is authenticated, because any query can reach any field through any path. Never infer permission from the shape of the query.
10. `context` carries the authenticated principal and the request-scoped loaders. Nothing below the resolver layer ever receives `context` (core rule 1).
11. Resolver signatures use the **generated** `Resolvers` types, so a schema change breaks the build instead of failing at runtime. No `any` in a resolver (rule D3).

## Server configuration

12. **Depth limit, cost/complexity limit and a query timeout are configured** before the first public client connects. Without them, one nested query can take the database down.
13. Introspection and the playground are **disabled in production**; public clients should use persisted/allowlisted operations where the project can support it.
14. Errors are masked in production by a single formatter: domain errors mapped to stable `extensions.code` values, internal messages and stack traces never sent to the client.
15. Subscriptions only when polling genuinely cannot work — they need their own authentication, backpressure and scaling story. First subscription requires an ADR.

## Types and clients

16. Server resolver types and client operation types are **generated** (`graphql-codegen`); generated files are never hand-edited (rule C3). Client documents live beside the components that use them.
17. A schema change and the codegen output land in the **same PR**, together with every consumer that had to change (see the `api-contract` skill).

## Verification (rule B1)

Run the **real operation** against the running server for the happy path and one failure, and watch the SQL log while doing it — the N+1 you cannot see in a unit test is visible there immediately.

```bash
curl -sS http://localhost:3000/graphql -H 'content-type: application/json' \
  -d '{"query":"query($id:ID!){ order(id:$id){ id status items { id product { name } } } }","variables":{"id":"ord_1"}}'
```
Evidence must state the operation, the response, and the query count observed for any new relation field.
