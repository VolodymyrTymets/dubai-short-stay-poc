---
description: Paths the agent must never write to, and paths that need confirmation first. Read by the guard-protected-paths hook.
---

# Protected paths

Globs here are matched against the path relative to the repo root with no implicit recursion — a bare
`dist/**` only matches a root-level `dist/`, not `api/dist/`. Every entry below is written to actually
match this repo's nested layout (`**/` prefix, or the real path from the root).

## Never write (hook blocks, no in-session override)

```
**/.env
**/.env.*
**/*.pem
**/*.key
**/*.p8
**/*.p12
**/*.jks
**/*.keystore
**/*id_rsa*
**/*credentials*.json
**/*service-account*.json
**/dist/**
**/build/**
**/coverage/**
**/.cache/**
**/*.generated.*
**/*.gen.*
**/generated/**
**/__generated__/**
**/node_modules/**
**/*-lock.json
**/*-lock.yaml
api/generated/**
api/generated/prisma/**
api/schema.gql
web/shared/api/generated.graphql.tsx
web/introspection.json
api/prisma/migrations/**/migration.sql
api/prisma/migrations/migration_lock.toml
api/yarn.lock
web/yarn.lock
```

Applied migration files under `api/prisma/migrations/` are immutable — add a new migration with
`yarn prisma-migrate`, never edit an existing one.

## Ask first (hook asks for confirmation)

```
.github/workflows/**
**/Dockerfile
**/docker-compose*.yml
CLAUDE.md
.claude/**
api/package.json
web/package.json
web/packages/*/package.json
api/tsconfig*.json
web/packages/*/tsconfig*.json
api/prisma/schema.prisma
api/prisma/models/**
web/codegen.ts
api/eslint.config.mjs
web/eslint.config.js
web/packages/*/eslint.config.js
web/packages/*/vite.config.ts
```

## Project additions

- `api/.claude/CLAUDE.md`, `api/.claude/rulse/**`, `api/.claude/skills/**` — the team's existing backend
  conventions doc and skills, loaded automatically under `api/`. Ask before restructuring; extend rather
  than replace.
- `doc/` — the SRS (`doc/DSS-SRS-v9 2.pdf`) and design mockups (`doc/designs/`). Reference-only, never
  generated or edited by the agent.
