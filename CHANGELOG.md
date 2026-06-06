# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- API build: type audit log `metadata` as `Prisma.InputJsonValue` for Prisma client compatibility.
- Web build: align React 18.3.1 across the monorepo (Expo + Next.js) via `pnpm.overrides` to fix `/404` prerender hook errors.

### Added

- Project documentation: `CONTRIBUTING.md`, `SECURITY.md`, and `docs/` guides.
- Root `pnpm-lock.yaml` for reproducible installs.

## [0.1.0] - 2026-06-06

### Added

- **Monorepo scaffold** — pnpm workspaces + Turborepo with shared `@neurolife/config`.
- **NeuroLife Pocket** (`apps/mobile`) — Expo 52 prebuild app with offline SQLite cache, local AI via `llama.rn`, sensory/haptic services, and rescue screens (stabilize, brain dump, room rescue, RSD reframe, leaving checklist).
- **NeuroLife Command Center** (`apps/web`) — Next.js 15 app with dashboard, budget, bills, documents, scary mail, food, housing, tasks, routines, weekly review, crisis, and AI workspace.
- **API** (`apps/api`) — NestJS 11 backend with JWT auth, Prisma/PostgreSQL, MinIO document storage, Redis/BullMQ hooks, and modules for profile, capacity, tasks, budget (safe-to-spend), documents, admin, appointments, food, housing, AI, sync, and notifications.
- **Packages**
  - `@neurolife/shared` — Zod schemas and neuro-affirming copy helpers
  - `@neurolife/design-system` — sensory-safe tokens and UI primitives
  - `@neurolife/database` — Prisma schema and client
  - `@neurolife/ai-core` — orchestrator with 8 specialist agents and privacy routing
  - `@neurolife/sync` — offline-first delta sync engine
  - `@neurolife/encryption` — field-level encryption utilities
- **Infrastructure** — Docker Compose for PostgreSQL 16, Redis 7, and MinIO.
- **Privacy modes** — `FULLY_LOCAL`, `SELF_HOSTED`, `HYBRID`, `CLOUD_ASSISTED`.

[Unreleased]: https://github.com/freqkflag/neurolife/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/freqkflag/neurolife/releases/tag/v0.1.0
