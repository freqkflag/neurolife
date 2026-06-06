# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Active development |

## Reporting a vulnerability

**Do not open public issues for security vulnerabilities.**

Email or DM the maintainer with:

1. Description of the issue and impact
2. Steps to reproduce
3. Affected components (API, web, mobile, sync)
4. Suggested fix (if any)

We aim to acknowledge reports within 72 hours.

## Security practices in this repo

- **Auth** — JWT access + refresh tokens; bcrypt password hashing.
- **Encryption** — Sensitive fields use `@neurolife/encryption` with `ENCRYPTION_MASTER_KEY` (rotate in production).
- **Documents** — Stored in MinIO/S3; presigned URLs for upload/download.
- **AI privacy** — `PrivacyRouter` in `@neurolife/ai-core` gates cloud providers; local/rule-based fallbacks when cloud keys are absent.
- **Audit** — `AuditService` logs user actions to `AuditLog` (metadata stored as Prisma JSON).

## Deployment checklist

- [ ] Replace all `change-me` secrets in `.env` (`JWT_*`, `ENCRYPTION_MASTER_KEY`, MinIO credentials).
- [ ] Restrict `CORS_ORIGIN` to your web origin.
- [ ] Run Postgres and Redis on private networks; do not expose MinIO console publicly.
- [ ] Enable TLS termination at your reverse proxy.
- [ ] Review `PrivacyMode` per user before enabling `CLOUD_ASSISTED` AI.

## Dependency updates

Run `pnpm audit` periodically. Security-related dependency bumps should be noted under `### Security` in [CHANGELOG.md](CHANGELOG.md).
