# Architecture

NeuroLife is an AuDHD-focused life operating system split across three surfaces that share one API and package layer.

## High-level diagram

```
┌─────────────────────┐     ┌─────────────────────┐
│  NeuroLife Pocket   │     │ NeuroLife Command   │
│  (Expo / mobile)    │     │ Center (Next.js)    │
│  Offline-first      │     │ Planning & admin    │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           │    HTTPS / JWT            │
           └───────────┬───────────────┘
                       ▼
              ┌─────────────────┐
              │  NestJS API     │
              │  Prisma ORM     │
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  PostgreSQL        Redis           MinIO
  (primary data)   (queues/cache)   (documents)
```

## Applications

### NeuroLife Pocket (`apps/mobile`)

In-the-moment support: regulation, rescue flows, brain dump, and offline capture.

| Area | Implementation |
|------|----------------|
| Routing | Expo Router (`app/`) |
| Local AI | `llama.rn` via `LocalAIService` |
| Offline | `expo-sqlite` + `@neurolife/sync` mutations |
| Sensory | `AudioSomaticService`, `SensorContextService`, `HapticBridgeService` |
| State | Zustand (`useAppStore`) |

**Screens:** dashboard, stabilize, brain-dump, room-rescue, RSD reframe, leaving checklist, food check, settings.

### NeuroLife Command Center (`apps/web`)

Planning, budgeting, documents, and specialist AI workspaces.

| Area | Implementation |
|------|----------------|
| Framework | Next.js 15 App Router |
| UI | Tailwind 4 + `@neurolife/design-system` tokens |
| API client | `src/lib/api.ts` → `NEXT_PUBLIC_API_URL` |

**Routes:** dashboard, budget (safe-to-spend, payday planner), bills, documents, scary-mail, admin, food, groceries, pantry, housing, tasks, routines, weekly-review, crisis, settings.

### API (`apps/api`)

NestJS 11 REST backend. Global validation pipe, CORS for web origin, JWT guards on protected routes.

**Domain modules:** auth, profile, capacity, tasks, budget, documents, admin, appointments, food, housing, ai, sync, notifications.

Cross-cutting: `AuditService`, `PrismaService`, `StorageService` (S3/MinIO).

## Shared packages

| Package | Role |
|---------|------|
| `@neurolife/shared` | Zod schemas, shared types, copy helpers |
| `@neurolife/design-system` | Color/spacing/typography tokens; `CapacityBattery`, `TinyNextActionCard`, `CalmLoading`, etc. |
| `@neurolife/database` | Prisma schema (~30 models), generated client export |
| `@neurolife/ai-core` | `AIOrchestrator`, 8 specialist agents, intent/privacy/platform routing |
| `@neurolife/sync` | Delta pull/push protocol for offline-first clients |
| `@neurolife/encryption` | AES field encryption for sensitive profile/document fields |
| `@neurolife/config` | Shared `tsconfig` and ESLint presets |

## AI specialists

`@neurolife/ai-core` exposes eight domain agents orchestrated by `AIOrchestrator`:

1. Budget
2. Admin & paperwork
3. Disability & benefits
4. Food & body needs
5. Housing stability
6. Tasks & routines
7. RSD & communication
8. Crisis stabilization

Providers: rule-based (offline), self-hosted HTTP, cloud (OpenAI when configured). Routing is controlled by user `PrivacyMode` and consent flags.

## Data model (summary)

Core entities in `packages/database/prisma/schema.prisma`:

- **User & profile** — privacy mode, theme, capacity preferences
- **Capacity & sensory** — `CapacityEntry`, `SensoryEntry`
- **Tasks & routines** — `Task`, `Routine`
- **Budget** — accounts, income, bills, subscriptions, debts, transactions, safe-to-spend inputs
- **Documents** — encrypted metadata + MinIO object keys
- **Life admin** — appointments, admin tasks, disability notes, housing items
- **Food** — pantry, meal plans, grocery lists
- **AI & audit** — `AIInteraction`, `AuditLog`
- **Sync** — mutation log for delta replication

## Monorepo tooling

- **pnpm** workspaces with `nodeLinker: hoisted`
- **Turborepo** — `build`, `dev`, `lint`, `typecheck` pipelines
- **React 18.3.1** pinned workspace-wide (Expo compatibility)

See [development.md](development.md) for commands and [api-overview.md](api-overview.md) for HTTP surface.
