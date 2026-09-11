# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trukkit API is a NestJS-based GraphQL server with a background worker. The project uses PostgreSQL with Prisma ORM and PostGIS for geospatial queries, Redis for caching and task queues, and BullMQ for background job processing.

## Architecture

### Mono-App Structure
The project contains two NestJS applications:
- **API Application** (`src/main.ts`): GraphQL server handling client requests, authentication, and data queries
- **Worker Application** (`src/worker.ts`): Background job processor using BullMQ for async tasks (SMS sending, etc.)

Both applications share code from `src/` modules but have separate entry points. The `nest-cli.json` defines two projects (`api` and `worker`).

### Core Modules

**PrismaModule**: Database access layer via Prisma ORM
- Adapter factory in `src/prisma/prisma.adapter.factory.ts` handles different adapters for dev/test/prod
- In tests: uses PGlite (in-memory PostgreSQL) for speed
- In production: uses native PostgreSQL
- Generated client located in `generated/prisma/client` (do not edit)

**AppModule** (main API):
- Configures GraphQL with Apollo Driver (schema auto-generated to `schema.gql`)
- Sets up multi-tier caching: in-memory (CacheableMemory, 60s TTL) + Redis fallback
- Registers BullMQ for job queue handling
- Imports AuthModule, NotifierModule, MigrationsModule

**WorkerModule** (background jobs):
- Configures BullMQ to process queues
- Imports SmsSenderModule for SMS notifications
- Runs as a separate NestJS application context

**AuthModule**: Handles authentication and GraphQL context injection

**NotifierModule**: SMS and log notifications with pluggable strategy pattern

**MigrationsModule**: Runs Prisma migrations on startup and provides migration utilities

### Data Layer

- Prisma schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/` (SQL files, one per directory)
- Configuration: `prisma.config.ts` with environment-aware adapter selection
- For tests, PGlite is initialized with PostGIS extension (`postgis` extension enabled in schema)

## Common Commands

### Development
```bash
# Install dependencies
yarn install

# Run API in watch mode
yarn run start:dev

# Run background worker in watch mode
yarn run worker:start:dev

# Run via Docker (includes PostgreSQL and Redis)
docker-compose up -d --build
```

### Testing
```bash
# Run all unit tests
yarn run test

# Run unit tests in watch mode
yarn run test:watch

# Run e2e tests
yarn run test:e2e

# Run with coverage report
yarn run test:cov

# Run a single test file
yarn run test -- src/auth/auth.service.spec.ts

# Run tests matching a pattern
yarn run test -- --testNamePattern="should authenticate"
```

### Code Quality
```bash
# Lint and fix code
yarn run lint

# Format code with Prettier
yarn run format
```

### Build & Deployment
```bash
# Build both applications
yarn run build

# Build just the worker
yarn run worker:build

# Run in production (requires built dist/)
yarn run start:prod

# Run worker in production
yarn run worker:start:prod
```

### Database
```bash
# Run Prisma migrations
yarn run prisma-migrate

# Regenerate Prisma client
yarn run prisma-gen

# Reset database (drops and recreates)
yarn run reset-db
```


## Environment Setup

### Local Development
Create `.env` file:
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/trukkit
REDIS_PORT=6379
REDIS_HOST=localhost
```

### Docker Development
Create `.env.development` file (used by docker-compose):
```env
PORT=3001
NODE_ENV=development
POSTGRES_PASSWORD=postgres
POSTGRES_DB=trukkit
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/trukkit?schema=public
REDIS_PORT=6379
REDIS_HOST=redis
```

### Testing
Create `.env.test` file:
```env
NODE_ENV=test
DATABASE_DIR=/tmp/pglite
```

## Background Jobs & Queue

BullMQ processes asynchronous jobs via Redis:
- Queue configuration in `AppModule` and `WorkerModule`
- Default retry policy: 3 attempts, remove on completion
- SMS queue defined in `src/background-workers/sms-sender/`
- Consumer implementations in `src/background-workers/`

To add a new queue:
1. Create a consumer in `src/background-workers/`
2. Register in `WorkerModule` with `BullModule.registerQueue({ name: 'queue-name' })`
3. Enqueue jobs in the API application

## GraphQL Schema

- Schema auto-generated to `schema.gql` on startup
- Resolvers use context injection for request data
- Context includes both HTTP headers and WebSocket connectionParams for subscriptions
- Apollo Driver caches the schema; restart needed for manual changes

## Key Files

- `src/app.module.ts` - Main API configuration
- `src/worker.ts` - Worker entry point
- `src/background-workers/worker.module.ts` - Worker module setup
- `src/prisma/` - Database layer and adapters
- `prisma/schema.prisma` - Data model definition
- `prisma.config.ts` - Prisma configuration with adapter factory
- `nest-cli.json` - NestJS application definitions
- `package.json` - Scripts and dependencies
- `docker-compose.yml` - Local dev environment (PostgreSQL, Redis, API)

## Troubleshooting

**Database connection errors**: Ensure PostgreSQL is running and DATABASE_URL is correct. For Docker, check that `postgres` service is healthy: `docker-compose ps`.

**PGlite test errors**: Tests require `@electric-sql/pglite` and PostGIS extension. Ensure `.env.test` sets `DATABASE_DIR` to a writable location.

**BullMQ queue issues**: Verify Redis is running on REDIS_HOST:REDIS_PORT. Check job retry counts (default 3) and `removeOnComplete` setting in BullModule config.

**GraphQL schema not updating**: Schema is auto-generated. If changes don't appear, restart the dev server and check for resolver/type errors in startup logs.
