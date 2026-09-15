# Dubai Short Stay — project constitution

Managed by the `apiko-agent` plugin. Hard rules only; depth lives in the pointers at the bottom.
Placeholders are filled by `/setup`. Keep this file under 200 lines — if a rule needs depth, move it
to `.claude/rules/`, `docs/`, or a skill and leave a pointer.

This repo is **two independent projects with no root package.json**: `api/` (NestJS GraphQL backend,
Prisma/PostGIS, Redis, BullMQ) and `web/` (a yarn-workspaces monorepo of two standalone Vite/React SPAs,
`guest` and `host`). Every command below is run from the named directory.

## Command map (the only commands you should run)

Each row runs both projects in one shot (`(cd <dir> && <cmd>)` subshells don't change your actual cwd) —
this is the real command to run whichever side you touched, and the one the DoD gate looks for.

| Task | Command |
|------|---------|
| install | `(cd api && yarn install); (cd web && yarn install)` |
| typecheck | none |
| lint | `(cd api && yarn lint); (cd web && yarn lint:all)` |
| unit tests | `(cd api && yarn test)` |
| affected tests | `(cd api && yarn test -- <path>)` |
| build | `(cd api && yarn build && yarn worker:build); (cd web && yarn build:all)` |
| dev server | `sh launch.sh` |
| full stack (Docker) | `docker-compose up -d --build` (repo root) |
| full stack, live dev (Docker) | `docker-compose watch` (repo root) — syncs source changes into running containers |
| e2e | `(cd api && yarn test:e2e)` |
| db migrate (local only) | `(cd api && yarn prisma-migrate)` |
| codegen (GraphQL types) | `(cd web/packages/guest && yarn codegen); (cd web/packages/host && yarn codegen)` |
| format | `(cd api && yarn format)` |

No standalone `typecheck` script exists: `api/`'s `build` (`nest build`) and `web/`'s `build` (`tsc -b && vite
build`) both typecheck as part of building. `web/` has no test runner or formatter configured yet, and no
browser e2e tool — the `unit tests`, `e2e` and `format` commands above only cover `api/`. `codegen` needs
the API dev server running. `dev server`'s `launch.sh` opens `api/`'s and `web/`'s own `launch.sh` in tabs
(`yarn start:dev` + `worker:start:dev`; `yarn dev:guest` + `yarn dev:host`).

Dependency manager: **yarn (classic v1)** for both — `web/package.json` pins `yarn@1.22.22`; `api/` has no
`packageManager` pin but uses `yarn.lock`. Never run `npm`/`pnpm` in either tree.
Runtime: Node is pinned to **22.16.0** via `api/Dockerfile`; `web/` has no runtime pin — match `api/`'s
version until one is added.

`yarn start:dev`, `yarn test:e2e` and `yarn codegen` need a running Postgres+PostGIS and Redis
(`docker-compose up -d` in `api/`, or local `redis-stack-server` + a local Postgres) — verify these live
before claiming a passing evidence block for a change that touches them.

- **T1** Run tasks through the commands above. Never invent a script name, never `cd` and guess.
- **T2** If your local Node version differs from `api/Dockerfile`'s pin, stop and report — do not work around it.
- **T3** Use yarn classic in both trees. Never hand-edit or delete `api/yarn.lock` or `web/yarn.lock`.
- **T4** CI and pipeline files are changed only in a dedicated PR with a human reviewer.

## A. Git and PR

- **A1** Never commit or push to `main`. Branch as `feat|fix|chore/<slug>` (no ticket tracker exists yet —
  see the project rule at the bottom for the `DSS-<n>` convention once one is adopted).
- **A2** Never `git push --force` to a shared branch; `--force-with-lease` on your own branch only.
- **A3** Never rewrite history that is already pushed and reviewed.
- **A4** One PR = one requirement. Open it as a **draft**. A human marks it ready. You never mark ready, never approve, never merge.
- **A5** Conventional Commits, imperative mood. No "AI generated" notes, no emoji.
- **A6** Never commit secrets, `.env*`, tokens, keystores, provisioning profiles or client data.
- **A7** The PR body uses the template: what changed, why, how it was verified (commands + output), what is NOT covered.

## B. Definition of done — verification is mandatory

- **B1** A task is done only when, for the affected workspace: lint passes, affected tests pass, and the
  change was executed — a real GraphQL request for `api/`, a real browser page for `web/`.
- **B2** Report the exact commands and their real output. Never claim a result you did not observe. List anything unverified under "Not verified".
- **B3** Never make a check pass by weakening it — no silencing the type checker or linter, no skipping or narrowing tests, no bypassing pre-commit hooks, no deleted assertions, no blind snapshot re-record, no removed CI steps — unless a human approved it in the PR and the line carries `WHY: <reason>`.
- **B4** If the correct fix is bigger than the ticket, stop and report. Do not paper over it.
- **B5** Attach evidence: screenshot for UI, request/response for API, the failing-then-passing test for a bug fix.

## C. Scope

- **C1** Change only what the requirement needs. No opportunistic refactors, renames, formatting sweeps or version bumps in a feature PR — propose them separately. (`yarn lint`/`yarn format` mutate files — run them, but revert unrelated fixes they make to files outside your change.)
- **C2** Never add a runtime dependency without explicit approval. Prefer what the repo already has.
- **C3** Never edit generated, vendored or native build artefacts — see `.claude/rules/protected-paths.md`.
- **C4** Never run a destructive or irreversible command (DB drop/reset, `rm -rf`, force push, deploy) without explicit human confirmation in the same message. `yarn reset-db` in `api/` runs `prisma migrate reset` — always confirm first.
- **C5** Never touch production — there is no production environment yet; local only. No prod DSNs or credentials.

## D. Code and context

- **D1** Read before you write: find the existing pattern for what you are building and follow it. A new pattern needs an ADR in `docs/decisions/`.
- **D2** This repo's conventions outrank generic best practice. When they conflict, follow the repo and raise the conflict.
- **D3** No escape hatch out of the type system in new code — no untyped catch-alls, no unchecked casts, no non-null assertions without a `WHY:` comment.
- **D4** Never invent an API. Verify library APIs with Context7 or the installed source; verify business rules in `doc/DSS-SRS-v9 2.pdf` or by asking.
- **D5** Errors are never swallowed. No empty `catch`, no silent `return null`.
- **D6** Comments explain *why*. No commented-out code. No `TODO` without an owner.
- **D7** No hardcoded user-facing strings once real UI copy exists. No i18n library is installed yet — flag it before the first customer-facing screen ships, don't silently build past it.
- **D8** No secrets, tokens, PII or full request bodies in logs.

## E. Documentation

- **E1** Docs update in the same PR as the code: `docs/ARCHITECTURE.md` on structural change, `docs/DOMAIN_GLOSSARY.md` on new domain terms, an ADR for a settled decision.
- **E2** A stale doc found while working is a bug: fix it in the same PR or file it in the PR body.

## F. Collaboration

- **F1** When planning, ask only genuine gaps you cannot resolve from code or docs — max two rounds — then proceed and state your assumptions.
- **F2** Escalate to a human when: acceptance criteria conflict with this constitution; a security or auth decision is involved; the work crosses an architectural boundary or looks like more than a day.
- **F3** State uncertainty plainly. "I am not sure" beats a confident guess.

## G. Client confidentiality (never relaxed)

- **G1** Repo code, data and credentials never leave the tools listed in `docs/AGENT_TOOLING.md`.
- **G2** Nothing project-specific is copied into the shared Apiko config or another repo. Only generic engineering conventions may be promoted, by a human, through a PR to the shared plugin.
- **G3** Reference files by path instead of pasting data into a prompt.

**Stack — `api/`:** backend **NestJS** · API **GraphQL** (Apollo Driver, code-first) · ORM **Prisma 7 + PostGIS**.
**Stack — `web/`:** **React 19 + Vite 8**, no meta-framework · data layer **Apollo Client** · styling **Tailwind v4** via `web/shared/theme.css` tokens · forms: none built yet (default to react-hook-form + zod when the first form ships).

- **S1** `.claude/rules/backend-core.md` applies to all of `api/src`. `backend-nestjs.md` and `api-graphql.md` **add** to it and never override it. If they appear to conflict, core wins and you raise it.
- **S2** Business logic never sees the transport. No `req`/`res`/GraphQL `context` below the service layer.
- **S3** `api/prisma/schema.prisma` (+ `api/prisma/models/*.prisma`) is the DB source of truth; `api/schema.gql` is Apollo's auto-generated GraphQL contract — never hand-edit either, they regenerate from `yarn prisma-gen` / server start. `web/`'s GraphQL client types are generated per-package into `src/gql/` by `yarn codegen` from the live server — also never hand-edited.
- **S4** Server schema, resolvers and every web consumer change in the **same PR**; `yarn codegen` output proves it.

## Project-specific rules (confirmed during `/setup`, 2026-09-14)

- Resolvers live at `api/src/<Module>/<Module>.resolver.ts`. Queries return `Entity` types (`api/src/<Module>/entities/`, mirroring `api/prisma/models/*.prisma`); mutations take `Input` types (`api/src/<Module>/dto/`). List queries always support pagination, sorting and filtering via `api/src/common/input/{pagination,sorting,search}.input.ts`. *(already documented by the team in `api/.claude/skills/api-conventions`.)*
- Tests run against a real database via PGlite (in-memory Postgres + PostGIS), never a mocked Prisma client — see `api/.claude/skills/test-conventions` and `DataCooker` (`api/test/utils/DataCooker/DataCooker.ts`). No Docker/Redis needed for `yarn test` or `yarn test:e2e`.
- `api/src/common/pagination.service.ts` and `prismacashing.service.ts` index Prisma models by a raw `collection: string` (`this.prismaService[collection]`), suppressed with `eslint-disable` for the unsafe `any` access. **This is legacy** — confirmed 2026-09-14: don't extend this pattern for new generic list/cache code; prefer a typed per-model repository instead.
- Ticket convention: none exists yet, so `.github/workflows/agent-checks.yml`'s evidence-check does **not**
  require a ticket ID (the upstream plugin template does — it was dropped here). The SRS at
  `doc/DSS-SRS-v9 2.pdf` and the mockups in `doc/designs/` use a `DSS-` prefix — adopt `DSS-<n>` as the PR
  ticket ID once an issue tracker exists, and re-add the check then.
- `web/packages/guest` has no local `eslint.config.js` (unlike `host`) and inherits `web/eslint.config.js` — this works today via ESLint's flat-config directory walk-up, but is worth aligning if it causes drift.

## Where things live

- Stack rules: `.claude/rules/` — auto-loaded when you touch a matching path
- Backend depth: `api/.claude/CLAUDE.md` (auto-loaded under `api/`) plus `api/.claude/skills/api-conventions`, `api/.claude/skills/test-conventions`
- Architecture: @docs/ARCHITECTURE.md
- Product goals & priorities (tie-breaker for judgement calls): @docs/BUSINESS_MODEL.md
- Domain terms: @docs/DOMAIN_GLOSSARY.md
- Settled decisions: `docs/decisions/`
- Agent tooling & MCP policy: @docs/AGENT_TOOLING.md
- How to run things: @docs/RUNBOOK.md
- Workflow: `/plan` → `/analyze` → `/implement` → `/review-pr`. The draft PR is the last stage of `/implement`, not a separate command.