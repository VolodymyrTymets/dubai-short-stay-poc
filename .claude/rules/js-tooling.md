---
description: JS/TS ecosystem tooling rules - dependency manager, workspace task running, TypeScript strictness, dependency additions, generated artefacts.
paths:
  - "api/package.json"
  - "web/package.json"
  - "web/packages/*/package.json"
  - "**/tsconfig*.json"
  - "web/codegen.ts"
---

# JS/TS tooling rules

Core rules T1–T4 already cover the command map, the pinned runtime, the single dependency manager and pipeline files. These add what is specific to this ecosystem.

1. Yarn classic (v1) in both `api/` and `web/`. Never mix managers, never delete or hand-edit `api/yarn.lock` or `web/yarn.lock`, never `--force` or `--ignore-engines` past a conflict — resolve the real version conflict or ask.
2. In `web/`, run per-package tasks with `yarn workspace <guest|host> <task>` from `web/`, or `cd` into the package — both are legitimate here since `web/` is a genuine two-app workspace, not a single deployable. Never guess a script name that isn't in that package's `package.json`.
3. Never add a dependency to `web/package.json` (the workspace root) for a single app's needs — add it to `guest`'s or `host`'s own `package.json`. One dependency change per PR, with size/licence/maintenance justified (rule C2).
4. **No `any` in new code** — `unknown` plus narrowing. No non-null `!` and no `as` cast without a `// WHY:`. No `@ts-ignore`/`@ts-expect-error` without a human-approved `// WHY:` (rule B3). Existing `eslint-disable` usage around `api/src/common/pagination.service.ts` and `prismacashing.service.ts`'s generic `collection: string` indexing is legacy — don't copy that pattern into new code.
5. `tsconfig` `paths`/aliases and `strict` flags change only with an ADR — they affect every package.
6. Generated output — `api/generated/prisma/**`, `api/schema.gql`, `web/shared/api/generated.graphql.tsx` (shared by both `web/` apps, run from `web/`) — is never hand-edited; fix the source and re-run `yarn prisma-gen` (api) or `yarn codegen` (web) (rule C3).
7. `node:` prefix for Node built-ins in `api/`. Module type is a per-package decision recorded in its `package.json` (`api/` is CommonJS via ts-jest/nest-cli; each `web/` package is `"type": "module"`), not improvised per file.
8. Peer dependencies on `web/shared/` are declared, not assumed from hoisting — a hoisted-only dependency breaks under a stricter installer.
9. Formatting: `api/` has `yarn format` (Prettier) and the formatter hook; `web/` has **no formatter configured** — don't introduce ad hoc reformatting there, and don't reformat files a PR does not otherwise touch (rule C1).
