# ADR-004 — BullMQ + Redis for background jobs, as a separate worker process sharing `src/`

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
Some work (SMS sending today, likely booking/notification jobs later) shouldn't block a GraphQL request-response cycle.

## Decision
Use BullMQ backed by Redis for the job queue. `api/nest-cli.json` defines two Nest applications from one
`src/` tree: `api` (`src/main.ts`, the GraphQL server) and `worker` (`src/worker.ts`, `WorkerModule`,
started separately via `yarn worker:start:dev` / `worker:start:prod`). Consumers live under
`api/src/background-workers/`.

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| In-process `setTimeout`/fire-and-forget | Not durable or retryable; explicitly disallowed by `backend-core.md` rule 20 |
| A separate microservice/repo for the worker | Overhead not justified yet; sharing `src/` keeps one deployable unit of code for a POC |

## Consequences
- Positive: retryable, durable background work; the API process stays responsive.
- Accepted cost: both `api` and `worker` need Redis reachable to start.
- Follow-ups: dead-letter handling and idempotency per `backend-core.md` rule 20 should be verified as real job types are added — only SMS sending exists today.

## Revisit when
Job volume or types grow enough that a dedicated worker deployment/repo is justified.
