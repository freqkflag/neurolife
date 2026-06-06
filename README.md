# NeuroLife

Cross-platform AuDHD life operating system — regulation in your pocket, planning at your desk.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10.11.0-orange)](package.json)

| Surface | Package | Role |
|---------|---------|------|
| **NeuroLife Pocket** | `apps/mobile` | In-the-moment regulation, rescue, capture, offline-first |
| **NeuroLife Command Center** | `apps/web` | Budgeting, life admin, documents, AI workspaces |
| **API** | `apps/api` | NestJS + Prisma backend — sync, AI orchestration, notifications |

## Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm 10 + Turborepo |
| API | NestJS 11, Prisma 6, PostgreSQL 16 |
| Web | Next.js 15, React 18.3, Tailwind 4 |
| Mobile | Expo 52, React Native 0.76, llama.rn |
| Infra (local) | Docker Compose — Postgres, Redis, MinIO |
| AI | `@neurolife/ai-core` — 8 specialist agents + privacy routing |

> React is pinned to **18.3.1** workspace-wide (Expo requirement). See [CONTRIBUTING.md](CONTRIBUTING.md#react-version-policy).

## Quick start

```bash
# Prerequisites: Node 22+, pnpm 10.11, Docker

git clone https://github.com/freqkflag/neurolife.git
cd neurolife

cp .env.example .env
docker compose -f services/docker-compose.yml up -d

pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed

pnpm dev
```

After clone, symlink env for API/Prisma: `ln -sf ../../.env apps/api/.env && ln -sf ../../.env packages/database/.env`

| App | URL / command |
|-----|----------------|
| Web (Command Center) | http://localhost:3000 |
| API | http://localhost:3001 |
| Mobile (Pocket) | `pnpm --filter @neurolife/mobile dev` (Metro **8082**) |
| API health | http://localhost:3001/health |
| Dev login | `dev@neurolife.local` / `dev-neurolife` after `pnpm db:seed` |

### Build & verify

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Packages

| Package | Purpose |
|---------|---------|
| `@neurolife/shared` | Zod schemas, types, neuro-affirming copy helpers |
| `@neurolife/design-system` | Sensory-safe tokens and components |
| `@neurolife/database` | Prisma schema and client |
| `@neurolife/ai-core` | Multi-agent orchestrator + 8 specialists |
| `@neurolife/sync` | Offline-first sync engine |
| `@neurolife/encryption` | Field-level encryption |
| `@neurolife/config` | Shared TypeScript and ESLint config |

## Privacy modes

`FULLY_LOCAL` · `SELF_HOSTED` · `HYBRID` · `CLOUD_ASSISTED`

Mobile rescue mode works offline without cloud API keys. Details: [docs/privacy-modes.md](docs/privacy-modes.md).

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/](docs/README.md) | Architecture, development, API, privacy |
| [CHANGELOG.md](CHANGELOG.md) | Version history ([Keep a Changelog](https://keepachangelog.com/)) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, conventions, PR workflow |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting |

## Project structure

```
neurolife/
├── apps/
│   ├── api/          # NestJS REST API
│   ├── web/          # Next.js Command Center
│   └── mobile/       # Expo Pocket app
├── packages/         # shared, database, ai-core, sync, …
├── services/         # docker-compose.yml
├── docs/             # guides
├── CHANGELOG.md
├── CONTRIBUTING.md
└── SECURITY.md
```

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Joey Hexx.
