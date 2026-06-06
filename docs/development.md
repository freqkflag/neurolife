# Development guide

## Prerequisites

- **Node.js** ≥ 22
- **pnpm** 10.11.0 (`corepack enable && corepack prepare pnpm@10.11.0 --activate`)
- **Docker** (Compose v2) for local Postgres, Redis, MinIO

## First-time setup

```bash
cp .env.example .env
# Edit secrets before any non-local deployment

# Symlinks so Nest (apps/api) and Prisma (packages/database) load the root .env:
ln -sf ../../.env apps/api/.env
ln -sf ../../.env packages/database/.env

docker compose -f services/docker-compose.yml up -d

pnpm install
pnpm db:generate
pnpm db:push    # or pnpm db:migrate once migration files exist
pnpm db:seed    # creates dev@neurolife.local / dev-neurolife
```

Wait for healthchecks: Postgres `:5432`, Redis `:6379`, MinIO `:9000` (console `:9001`).

## Environment variables

Copy from [.env.example](../.env.example). Key groups:

| Group | Variables | Notes |
|-------|-----------|-------|
| Database | `DATABASE_URL` | Matches Docker Compose defaults |
| Cache | `REDIS_URL` | Used by BullMQ notification workers |
| Storage | `S3_*` | MinIO locally; any S3-compatible endpoint in prod |
| Auth | `JWT_*` | Access + refresh secrets and TTLs |
| Encryption | `ENCRYPTION_MASTER_KEY` | 32+ chars; required for sensitive fields |
| AI | `OPENAI_API_KEY`, `SELF_HOSTED_AI_URL` | Optional; see [privacy-modes.md](privacy-modes.md) |
| Apps | `API_PORT`, `NEXT_PUBLIC_API_URL` | API default `3001`, web `3000` |

Optional: `CORS_ORIGIN` (defaults to `http://localhost:3000`).

## Running apps

### All apps (Turborepo)

```bash
pnpm dev
```

### Individual apps

```bash
# API — http://localhost:3001
pnpm --filter @neurolife/api dev

# Web — http://localhost:3000
pnpm --filter @neurolife/web dev

# Mobile — Expo dev client (Metro on port 8082; 8081 often in use)
pnpm --filter @neurolife/mobile dev
```

API health check: `curl http://localhost:3001/health`

### Mobile native builds

```bash
pnpm --filter @neurolife/mobile prebuild   # generates ios/ android/
pnpm --filter @neurolife/mobile android    # requires Android SDK
pnpm --filter @neurolife/mobile ios        # requires macOS + Xcode
```

> **Note:** Prebuild may warn about missing Expo icon and `expo-system-ui`. These are non-fatal for development.

## Quality checks

```bash
pnpm typecheck    # TypeScript across workspace
pnpm lint         # ESLint per package
pnpm build        # Production builds (Nest, Next, tsc packages)
pnpm format       # Prettier write
```

## Database commands

| Command | Purpose |
|---------|---------|
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:migrate` | Create/apply dev migrations |
| `pnpm db:push` | Push schema without migration (prototyping only) |

Schema lives in `packages/database/prisma/schema.prisma`.

## Docker services

```bash
# Start
docker compose -f services/docker-compose.yml up -d

# Stop
docker compose -f services/docker-compose.yml down

# Reset volumes (destructive)
docker compose -f services/docker-compose.yml down -v
```

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5432 | `neurolife` / `neurolife` |
| Redis | 6379 | none |
| MinIO API | 9000 | `neurolife` / `neurolifesecret` |
| MinIO Console | 9001 | same |

## Troubleshooting

### `pnpm build` fails on API (`InputJsonValue`)

Audit log metadata must use `Prisma.InputJsonValue`, not `Record<string, unknown>`. See `apps/api/src/common/audit.service.ts`.

### Web build fails on `/404` with `useRef` null

Usually a React version mismatch. This repo pins React **18.3.1** via root `pnpm.overrides` because Expo requires 18.x. Run `pnpm install` after pulling.

### Turbo cache shows stale builds

```bash
pnpm build --force
# or
rm -rf .turbo apps/*/.turbo packages/*/.turbo
```

### Prisma client out of date

```bash
pnpm db:generate
```

## Release checklist

1. Move `[Unreleased]` entries in [CHANGELOG.md](../CHANGELOG.md) to a dated version section.
2. Tag: `git tag -a v0.1.x -m "v0.1.x"`
3. `pnpm build` clean on CI/local.
4. Push tag: `git push origin v0.1.x`
