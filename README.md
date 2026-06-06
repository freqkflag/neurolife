# NeuroLife

Cross-platform AuDHD life operating system.

- **NeuroLife Pocket** (`apps/mobile`) — in-the-moment regulation, rescue, capture, offline-first
- **NeuroLife Command Center** (`apps/web`) — budgeting, life admin, documents, AI workspaces
- **API** (`apps/api`) — NestJS + Prisma backend with sync, AI orchestration, notifications

## Stack

- pnpm + Turborepo monorepo
- NestJS + Prisma + PostgreSQL
- Next.js 15 (web)
- Expo Prebuild + llama.rn (mobile local AI)
- 8 specialist AI agents in `@neurolife/ai-core`

## Quick start

```bash
# Prerequisites: Node 22+, pnpm, Docker

cp .env.example .env
docker compose -f services/docker-compose.yml up -d

pnpm install
pnpm db:generate
pnpm db:migrate

pnpm dev
```

| App    | URL                    |
|--------|------------------------|
| Web    | http://localhost:3000  |
| API    | http://localhost:3001  |
| Mobile | `pnpm --filter @neurolife/mobile dev` |

## Packages

| Package | Purpose |
|---------|---------|
| `@neurolife/shared` | Zod schemas, types, neuro-affirming copy helpers |
| `@neurolife/design-system` | Sensory-safe tokens and components |
| `@neurolife/database` | Prisma schema and client |
| `@neurolife/ai-core` | Multi-agent orchestrator + 8 specialists |
| `@neurolife/sync` | Offline-first sync engine |
| `@neurolife/encryption` | Field-level encryption |

## Privacy modes

`FULLY_LOCAL` · `SELF_HOSTED` · `HYBRID` · `CLOUD_ASSISTED`

Mobile rescue mode works offline without cloud API keys.
