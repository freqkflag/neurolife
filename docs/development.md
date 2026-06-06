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

Optional: `CORS_ORIGIN` (comma-separated; defaults to `http://localhost:3000`). `API_HOST` defaults to `0.0.0.0` so the API is reachable on the LAN.

## Running apps

### All apps (Turborepo)

```bash
pnpm dev
```

### Headless homelab / LAN access

On a server without a local browser, bind services to the LAN so a Chromebook or phone on the same network can reach them. **Use the homelab IP, not `localhost`, on remote devices.**

```bash
# One-shot (foreground)
pnpm dev:lan

# Persistent background session (recommended on headless Ubuntu)
pnpm dev:tmux          # starts detached tmux session "neurolife"
tmux attach -t neurolife # view logs; Ctrl+b then d to detach

pnpm stop:dev          # stop ports 3000, 3001, 8082
pnpm health            # port + HTTP checks (localhost + LAN IP)
pnpm verify:dev        # health + dev login + dashboard API
```

| URL (example IP) | Service |
|------------------|---------|
| http://192.168.12.127:3000 | Web Command Center |
| http://192.168.12.127:3001/health | API health |
| 192.168.12.127:8082 | Expo Metro |

Override auto-detected IP: `DEV_LAN_IP=192.168.12.127 pnpm dev:lan`

If LAN HTTP fails but localhost works, open the firewall:

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 8082/tcp
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
