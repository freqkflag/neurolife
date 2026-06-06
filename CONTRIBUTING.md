# Contributing to NeuroLife

Thank you for helping build a neuro-affirming life operating system. This guide covers local setup, conventions, and how to propose changes.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22 |
| pnpm | 10.11.0 (see root `packageManager`) |
| Docker | For Postgres, Redis, MinIO |

## Getting started

```bash
git clone https://github.com/freqkflag/neurolife.git
cd neurolife

cp .env.example .env
docker compose -f services/docker-compose.yml up -d

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

See [docs/development.md](docs/development.md) for environment variables, per-app commands, and troubleshooting.

## Repository layout

```
apps/
  api/      NestJS REST API
  web/      Next.js Command Center
  mobile/   Expo Pocket app
packages/
  shared/         Zod schemas & types
  design-system/  Tokens & components
  database/       Prisma schema
  ai-core/        Specialist agents
  sync/           Offline sync
  encryption/     Field encryption
  config/         Shared TS/ESLint config
services/
  docker-compose.yml
```

## Development workflow

1. **Branch** from `main` using a descriptive name (`fix/sync-conflict`, `feat/pantry-scan`).
2. **Change** the smallest surface that solves the problem; match existing patterns in the touched package.
3. **Verify** before opening a PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
4. **Document** user-facing changes in [CHANGELOG.md](CHANGELOG.md) under `[Unreleased]`.
5. **Open a PR** with a clear summary and test plan.

## Code conventions

- **TypeScript** everywhere; strict types, no `any` unless unavoidable.
- **API** — NestJS modules per domain; DTOs with `class-validator`; guards for auth.
- **Web** — App Router; `'use client'` only where hooks or browser APIs are required.
- **Mobile** — Expo Router file-based routes; offline-first assumptions for Pocket flows.
- **Shared logic** lives in `packages/*`, not duplicated across apps.
- **Copy** — neuro-affirming, low-shame language (see `@neurolife/shared` helpers).

## React version policy

Expo 52 requires **React 18.3.1**. The root `pnpm.overrides` pin `react` and `react-dom` to 18.3.1 for the whole workspace. Do not bump web to React 19 without a coordinated mobile migration.

## Database changes

1. Edit `packages/database/prisma/schema.prisma`.
2. Run `pnpm db:migrate` with a descriptive migration name.
3. Commit the migration SQL under `packages/database/prisma/migrations/`.

## Changelog entries

Follow [Keep a Changelog](https://keepachangelog.com/) categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

Example:

```markdown
### Fixed
- Sync push: reject mutations with future `updatedAt` timestamps.
```

## Questions

Open a [GitHub issue](https://github.com/freqkflag/neurolife/issues) for bugs, ideas, or architecture discussions.
