# API overview

Base URL: `http://localhost:3001` (configurable via `API_PORT`).

Authentication uses **Bearer JWT** on protected routes unless noted.

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | API liveness; includes database connectivity |

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Returns access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate access token |

Request bodies use DTOs in `apps/api/src/auth/auth.dto.ts` (`email`, `password`, etc.).

## Protected modules

All routes below require `Authorization: Bearer <access_token>`.

### Profile — `/profile`

User preferences, privacy mode, theme, neuro profile fields.

### Capacity — `/capacity`

Capacity and sensory logging for spoon-tracking and regulation context.

### Tasks — `/tasks`

CRUD for tasks and routines integration.

### Budget — `/budget`

Accounts, income, bills, subscriptions, debts, transactions, and **safe-to-spend** calculations (`safe-to-spend.service.ts`).

### Documents — `/documents`

Metadata in Postgres; file bytes stored locally under `storage/documents/{userId}/` (dev). Presigned MinIO upload available via `POST /documents/upload-url` but web uses multipart upload.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/documents` | List documents with latest extractions |
| POST | `/documents/upload` | Multipart upload (PDF, PNG, JPG, TXT, MD — max 10MB) |
| POST | `/documents/analyze-text` | `{ content, documentId? }` — paste scary-mail text; returns structured cards |
| GET | `/documents/:id/extractions` | Extraction history for a document |
| POST | `/documents/:id/extract` | Extract text from stored file (`pdf-parse` / `tesseract.js` / direct read) |
| POST | `/documents/:id/analyze` | Extract (if needed) + `admin_paperwork` analysis; persists `DocumentExtraction` |

Supported extraction: **TXT/MD** (direct), **PDF** (text layer via `pdf-parse`), **PNG/JPG** (OCR via `tesseract.js`). Scanned PDFs without a text layer return `ocr_unavailable` — paste into Scary Mail or wait for future OCR pass.

Privacy: cloud AI only when `Profile.privacyMode` allows and `aiConsentGiven` / consent flags are set; otherwise rule-based local document analysis.

### Admin — `/admin`

Life-admin tasks (paperwork, calls, deadlines).

### Appointments — `/appointments`

Scheduling and reminder-related records.

### Food — `/food`

Pantry, meal plans, grocery items.

### Housing — `/housing`

Rent, utilities, applications, maintenance tracking.

### AI — `/ai`

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/ai/chat` | `{ input, context?, specialist?, consentGiven? }` | Run orchestrator / specialist |

`specialist` values match `@neurolife/ai-core` types: `budget`, `admin_paperwork`, `disability_benefits`, `food_body`, `housing`, `task_routine`, `rsd_communication`, `crisis_stabilization`.

### Sync — `/sync`

Offline-first delta replication for mobile (and future clients).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sync/delta?since=<iso>` | Pull changes since timestamp |
| POST | `/sync/push` | `{ mutations: SyncMutation[] }` |

Mutation shapes are defined in `@neurolife/sync`.

### Notifications — `/notifications`

Notification rules and delivery hooks (Redis/BullMQ backed).

## Errors

- **400** — validation failure (`class-validator`)
- **401** — missing or invalid JWT
- **404** — entity not found (domain services)

## Audit trail

`AuditService` writes to `AuditLog` for sensitive actions. Metadata is stored as JSON (`Prisma.InputJsonValue`).

## CORS

Default allowed origin: `http://localhost:3000`. Set `CORS_ORIGIN` for other web deployments.

## Related docs

- [Architecture](architecture.md) — module layout
- [Privacy modes](privacy-modes.md) — AI routing and consent
- [Development](development.md) — running the API locally
