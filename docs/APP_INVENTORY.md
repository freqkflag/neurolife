# NeuroLife Application Inventory

> Generated audit of the full monorepo as of commit on `main`.  
> Purpose: see what exists, what is partial, what is missing, and what to prioritize next.

---

## 1. Repository structure

| Path | Purpose | Status |
|------|---------|--------|
| `apps/web` | Next.js 15 Command Center (life management UI) | **Active MVP** — 19 routes, most wired to API |
| `apps/mobile` | Expo Router Pocket app (regulation/rescue) | **Prototype** — offline/local only, no API |
| `apps/api` | NestJS REST API + Prisma + AI orchestration | **Active MVP** — 14 controllers, 46 routes |
| `packages/shared` | Zod schemas, constants, copy, shame-language helpers | **Stable** — types used across apps |
| `packages/ai-core` | AIOrchestrator, 8 specialist agents, routing, providers | **Stub-heavy** — rule-based fallback default |
| `packages/design-system` | Tokens + 5 shared React/RN components | **Partial** — web uses CSS vars; mobile uses themes |
| `packages/database` | Prisma schema (27 models), seed script | **Active** — `db push` workflow |
| `packages/encryption` | AES-256-GCM field encryption | **Minimal** — used in document extract audit only |
| `packages/sync` | SyncEngine + conflict resolution | **Library only** — API wired; mobile queue stubbed |
| `services/` | `docker-compose.yml` (Postgres, Redis, MinIO) | **Dev infra** |
| `docs/` | Architecture, dev, privacy, API overview | **Growing** — this inventory adds gap/roadmap |
| `scripts/` | `dev-lan.sh`, `stop-dev.sh`, `health.sh`, `verify-dev.sh`, `dev-tmux.sh` | **Working** |

---

## 2. Web app pages (19 user-facing routes)

All pages use root `layout.tsx` → `AppShell` (sidebar hidden on `/login`).  
Auth: JWT in `localStorage` (`neurolife_access_token`). Unauthenticated users see `AuthGate` prompt or login redirect.

| Route | Purpose | UI status | Forms / actions | API endpoints | Persists on refresh | Missing | Priority |
|-------|---------|-----------|-----------------|---------------|---------------------|---------|----------|
| `/` | Redirect to dashboard | Works | — | — | — | — | Low |
| `/login` | Sign in | **Complete** | Email/password form | `POST /auth/login` | Token in localStorage | Refresh token unused on web; no register UI | Medium |
| `/dashboard` | Command center overview | **Good** | Links, AI workspace | `GET /capacity`, `/budget/safe-to-spend`, `/tasks` | Yes (API) | Sensory not shown; no appointments | High |
| `/budget` | Budget overview | **Good** | Update balance form | `GET /budget`, `GET /budget/safe-to-spend`, `POST /budget/balance` | Yes | Income sources, subscriptions, debts UI | High |
| `/budget/safe-to-spend` | Safe-to-spend breakdown | **Good** | Read-only + explain | `GET /budget/safe-to-spend` | Yes | No bill-level drill-down | Medium |
| `/budget/payday-planner` | Payday planning | **Good** | Save plan, add bills | `GET/POST /budget/payday-plan`, `POST /budget/bills` | Yes | No income source sync; no bill edit/delete | High |
| `/bills` | Bill tracker | **Good** | Add bill form | `GET /budget`, `POST /budget/bills` | Yes | Mark paid, edit, delete, reminders | High |
| `/documents` | Document vault | **Good** | Upload file + metadata, analyze | `GET /documents`, `POST /documents/upload`, `POST /documents/:id/analyze` | Yes | PDF/image OCR; download; delete | Critical |
| `/scary-mail` | Scary mail summarizer | **Good** | Paste text or pick document | `POST /ai/chat`, `GET /documents`, `POST /documents/:id/analyze` | Analysis ephemeral until saved via analyze | Privacy consent UI; structured cards thin | High |
| `/admin` | Admin tasks + disability notes | **Good** | Add task, add note | `GET/POST /admin/tasks`, `GET/POST /admin/disability` | Yes | Task status updates; link to documents | Medium |
| `/disability` | Disability & benefits hub | **Stub** | None | None | No | Full page; API exists under `/admin/disability` | High |
| `/food` | Food / groceries / low-spoon | **Good** | Add grocery item | `GET /food/groceries`, `/food/pantry`, `/food/low-spoon`, `POST /food/groceries` | Yes | Pantry add/edit; meal plans; diabetes mode | Medium |
| `/groceries` | Grocery list (standalone) | **Stub** | None | None (duplicates `/food`) | No | Wire to `/food/groceries` or remove route | Medium |
| `/pantry` | Pantry (standalone) | **Stub** | None | None (duplicates `/food`) | No | Wire to `/food/pantry` or remove route | Medium |
| `/housing` | Housing items + rent countdown | **Good** | Add housing item | `GET /housing`, `GET /housing/rent-countdown`, `POST /housing` | Yes | Utilities workflow; move checklist | Medium |
| `/tasks` | Task list | **Good** | Add task, complete | `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id/complete` | Yes | Edit, delete, due-date sort, capacity filter | High |
| `/routines` | Routines | **Partial** | Create routine (name + 1 step) | `GET /tasks/routines`, `POST /tasks/routines` | Yes | Multi-step editor, run routine, complete steps | Medium |
| `/weekly-review` | Weekly reflection | **Partial** | Save review fields | None — **localStorage only** | Per-browser only | API persistence, export | Medium |
| `/crisis` | Crisis stabilization | **Partial** | Client-side checkboxes | None | **No** — resets on refresh | API + AI crisis agent; support contacts | Critical |
| `/settings` | Profile & privacy | **Good** | Privacy mode, sign out | `GET/PATCH /profile`, `GET /health` | Yes | Theme selector; export/delete account UI; quiet hours | Medium |

**Summary:** 19 routes inventoried. **12 Good**, **4 Partial**, **3 Stub**.

---

## 3. Mobile app (NeuroLife Pocket)

### Screens (Expo Router)

| Route | Screen | Status |
|-------|--------|--------|
| `/` | DashboardScreen | **Works** — capacity, sensory, stuck button, shortcuts |
| `/stabilize` | StabilizeFirstScreen | **Works** — crisis fallbacks, local AI |
| `/food-check` | (food-check.tsx) | **Basic** — interoceptive prompts |
| `/room-rescue` | RoomRescueScreen | **Basic** — entrainment ramp trigger |
| `/brain-dump` | BrainDumpScreen | **Works** — saves to SQLite + Zustand |
| `/leaving` | LeavingChecklistScreen | **Works** — checklist generation |
| `/rsd` | RSDQuickReframeScreen | **Works** — message reframe |
| `/settings` | SettingsScreen | **Basic** — theme, privacy mode (local only) |

### Services

| Service | Implementation | Status |
|---------|----------------|--------|
| `LocalAIService` | `llama.rn` optional; rule-based fallbacks | **Stub unless model path set** |
| `AudioSomaticService` | expo-av BPM ramps, placeholder asset URIs | **Stub** — audio files not bundled |
| `HapticBridgeService` | expo-haptics patterns + hyperfocus bridge | **Real** |
| `SensorContextService` | Accelerometer + screen time; noise/light hardcoded | **Partial** |
| `BiometricCapacityService` | Sleep/HRV scoring (no wearable feed) | **Partial** — manual only |
| `offlineDb` | SQLite: tiny_action, brain_dump, sync_queue | **Real** — local only |

### Expo / native config

- **Name:** NeuroLife Pocket (`com.neurolife.pocket`)
- **Plugins:** expo-router, expo-sqlite, expo-build-properties, **llama.rn**
- **New Architecture:** enabled
- **No API calls** — mobile is fully disconnected from backend today

### What mobile can do today

- Show capacity/sensory from Zustand (manual/default values)
- Generate tiny next actions via rule-based local AI
- Save brain dumps and tiny actions offline
- Trigger haptic patterns
- Navigate rescue flows (stabilize, RSD, leaving, room rescue)
- Attempt audio regulation (will fail without bundled assets)

### NeuroLife Pocket still needs

- API auth + sync integration
- Bundled EDM/audio assets or streaming
- On-device LLM model download/setup UX
- Real ambient noise/light sensors (or HealthKit/wearable)
- Push notifications for transitions
- Bi-directional sync with Command Center tasks/routines
- Crisis support contacts from API

---

## 4. API inventory (46 routes)

Auth legend: **Public** = no JWT; **JWT** = `@UseGuards(JwtAuthGuard)`.

### `auth` — Public

| Method | Route | Body | Response | DB | Works | Gaps |
|--------|-------|------|----------|-----|-------|------|
| POST | `/auth/register` | email, password, displayName? | accessToken, refreshToken | User, Profile, RefreshToken | Yes | No email verification |
| POST | `/auth/login` | email, password | accessToken, refreshToken | User | Yes | — |
| POST | `/auth/refresh` | refreshToken | accessToken, refreshToken | RefreshToken | Yes | Rotation only partial |

### `health` — Public

| Method | Route | Works |
|--------|-------|-------|
| GET | `/health` | Yes — `{ status: 'ok' }` |

### `profile` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/profile` | Profile | Yes | Payday fields not in PATCH |
| PATCH | `/profile` | Profile | Yes | Limited fields (no balance/payday) |
| POST | `/profile/export` | User + relations | Yes | No download format options |
| DELETE | `/profile` | User (soft) | Yes | No hard delete / cascade docs |

### `capacity` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/capacity` | CapacityEntry, SensoryEntry | Yes | Returns latest only |
| POST | `/capacity` | CapacityEntry | Yes | No validation DTO |
| POST | `/capacity/sensory` | SensoryEntry | Yes | No validation DTO |

### `budget` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/budget` | Profile, Bill, Subscription, Debt, Income, Transaction | Yes | Many models unused in UI |
| GET | `/budget/safe-to-spend` | Profile, Bill | Yes | 30-day window hardcoded |
| GET | `/budget/payday-plan` | Profile, Bill | Yes | — |
| POST | `/budget/payday-plan` | Profile | Yes | — |
| POST | `/budget/bills` | Bill | Yes | No update/delete endpoints |
| POST | `/budget/balance` | Profile | Yes | — |

### `documents` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/documents` | Document, DocumentExtraction | Yes | — |
| POST | `/documents/upload` | Document + local file | Yes | PDF/image extract pending |
| POST | `/documents` | Document | Yes | Metadata-only legacy path |
| POST | `/documents/upload-url` | — (S3 presign) | Partial | MinIO dev; not used by web |
| POST | `/documents/:id/analyze` | DocumentExtraction, AIInteraction | Yes (TXT/MD) | OCR/PDF pipeline TODO |
| POST | `/documents/:id/extract` | DocumentExtraction | Yes | Legacy; content in body |

### `ai` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| POST | `/ai/chat` | AIInteraction, Profile | Yes (stub output) | Cloud only with key+consent |

### `tasks` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/tasks` | Task | Yes | Soft-delete filter |
| POST | `/tasks` | Task | Yes | — |
| PATCH | `/tasks/:id/complete` | Task | Yes | No uncomplete |
| GET | `/tasks/routines` | Routine, RoutineStep | Yes | Steps often empty |
| POST | `/tasks/routines` | Routine, RoutineStep | Partial | Single step only |

### `admin` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/admin/tasks` | AdminTask | Yes | — |
| POST | `/admin/tasks` | AdminTask | Yes | No status update route |
| GET | `/admin/disability` | DisabilityNote | Yes | — |
| POST | `/admin/disability` | DisabilityNote | Yes | — |

### `food` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/food/pantry` | FoodItem | Yes | — |
| GET | `/food/groceries` | GroceryItem | Yes | — |
| GET | `/food/meals` | MealPlan | Yes | No UI |
| GET | `/food/low-spoon` | MealPlan | Yes | — |
| POST | `/food/groceries` | GroceryItem | Yes | No pantry POST |

### `housing` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/housing` | HousingItem | Yes | — |
| GET | `/housing/rent-countdown` | Profile | Yes | — |
| POST | `/housing` | HousingItem | Yes | — |

### `appointments` — JWT (no web UI)

| Method | Route | DB | Works |
|--------|-------|-----|-------|
| GET | `/appointments` | Appointment | Yes |
| POST | `/appointments` | Appointment | Yes |
| GET | `/appointments/:id/prep` | Appointment | Yes |

### `notifications` — JWT

| Method | Route | DB | Works | Gaps |
|--------|-------|-----|-------|------|
| GET | `/notifications/rules` | NotificationRule | Yes | Not wired to web |
| PATCH | `/notifications/rules` | NotificationRule | Partial | Composite ID hack |
| POST | `/notifications/snooze` | NotificationRule | Yes | No delivery channel |

### `sync` — JWT

| Method | Route | Works | Gaps |
|--------|-------|-------|------|
| GET | `/sync/delta` | Yes | Mobile doesn't call |
| POST | `/sync/push` | Yes | No mobile client |

**API tests:** None found. **Validation:** DTOs only on auth; most endpoints use `Record<string, unknown>`.

---

## 5. Database schema (27 models)

| Model | Feature area | Used by | Sensitivity |
|-------|--------------|---------|-------------|
| User | Auth | API | High |
| RefreshToken | Auth | API | High |
| Profile | Settings, budget, privacy | Web, API | High |
| CapacityEntry | Dashboard, capacity | Web, API, sync | Medium |
| SensoryEntry | Sensory load | API, sync | Medium |
| Task | Tasks, dashboard | Web, API, sync | Medium |
| Routine | Routines | Web, API, sync | Medium |
| RoutineStep | Routines | API (partial) | Low |
| BudgetAccount | Budget | Schema only | High |
| IncomeSource | Budget | Schema only | High |
| Bill | Bills, payday | Web, API, sync | High |
| Subscription | Budget | Schema only | High |
| Debt | Budget | Schema only | High |
| PawnLoan | Budget | Schema only | Medium |
| Transaction | Budget | Schema only | High |
| SpendingCategory | Budget | Schema only | Medium |
| SavingsGoal | Budget | Schema only | Medium |
| Document | Document vault | Web, API, sync | **Critical** |
| DocumentExtraction | Scary mail / analyze | Web, API | **Critical** |
| AdminTask | Admin | Web, API | Medium |
| Appointment | Appointments | API only | Medium |
| DisabilityNote | Admin/disability | Web (admin), API | **Critical** |
| SymptomTimelineEntry | Disability | Schema only | **Critical** |
| FoodItem | Food/pantry | API, sync | Low |
| MealPlan | Food | API only | Low |
| GroceryItem | Food | Web, API | Low |
| HousingItem | Housing | Web, API | Medium |
| SupportContact | Crisis | Sync only | High |
| AIInteraction | AI audit | API | Medium |
| NotificationRule | Notifications | API | Low |
| AuditLog | Security audit | API | Medium |

**Missing fields/relationships:** Profile PATCH doesn't expose payday fields; Document lacks download URL; Bill lacks `reminderSentAt`; no explicit consent audit on AI beyond AIInteraction.

---

## 6. AI system

### Architecture

- **Entry:** `POST /ai/chat` → `AiService.process` → `AIOrchestrator.route`
- **Routing:** `IntentClassifier` (regex) → `PlatformRouter` → `PrivacyRouter` → agent
- **Providers:** `RuleBasedProvider` (default), `SelfHostedProvider`, `CloudProvider` (OpenAI)
- **Output schema:** `TinyActionOutput` — `{ summary, tinyNextAction, uncertainty?, cards? }`

### Specialist agents (8)

| Agent | Exists | Real AI | Used by pages |
|-------|--------|---------|---------------|
| `budget` | Yes | Stub* | Dashboard AI workspace, budget context |
| `admin_paperwork` | Yes | Stub* | Scary Mail, Documents analyze |
| `disability_benefits` | Yes | Stub* | Specialist workspace only |
| `food_body` | Yes | Stub* | Specialist workspace only |
| `housing` | Yes | Stub* | Specialist workspace only |
| `task_routine` | Yes | Stub* | Default fallback |
| `rsd_communication` | Yes | Stub* | Mobile RSD screen (local, not API) |
| `crisis_stabilization` | Yes | Stub* | Not wired to Crisis page |

\*Real only when `OPENAI_API_KEY` + consent + `CLOUD_ASSISTED`/`HYBRID` privacy mode; otherwise `RuleBasedProvider` returns generic JSON.

### Privacy mode

- Read from `Profile.privacyMode` in `AiService`
- `FULLY_LOCAL` / no key → always rule-based
- Document analyze respects consent flag on Document model
- **Gap:** Web settings saves privacy mode but AI pages don't show per-request consent

### Missing AI workflows

- PDF/image OCR → admin_paperwork pipeline
- Disability page dedicated agent UI
- Crisis page → `crisis_stabilization` agent
- Structured cards consistently rendered (only Scary Mail partial)
- Budget agent tied to payday planner insights
- RSD agent on web (mobile only, local)

---

## 7. Design system

### Packages (`@neurolife/design-system`)

| Export | Type | Web usage | Mobile usage |
|--------|------|-----------|--------------|
| `themes` / color tokens | Tokens | Via CSS vars in `globals.css` | Zustand theme |
| `CapacityBattery` | Component | Dashboard | Dashboard |
| `TinyNextActionCard` | Component | Most MVP pages | Dashboard, screens |
| `CalmLoading` | Component | MVP views | — |
| `PauseButton` | Component | — | — |
| `SensoryLoadIndicator` | Component | — | — |
| a11y rules | Utilities | Not enforced in lint | — |

### Web styling

- Tailwind v4 via `@import 'tailwindcss'` in `globals.css`
- `data-theme="mutedDark"` on `<html>`
- `AppShell` layout, `mvp/ui.tsx` shared form patterns
- **Inconsistent:** `/disability`, `/groceries`, `/pantry` lack MVP shell

### Needed components

- Form field group / section headers
- Bill card with paid/due states
- Document card with file type icon
- Empty state illustration pattern
- Mobile-responsive sidebar / bottom nav
- Toast / calm error banner
- Consent checkbox for AI/document analysis

---

## 8. Sync / offline

| Layer | Status |
|-------|--------|
| `packages/sync` SyncEngine | **Real** — pull/push with conflict resolution |
| API `/sync/delta` + `/sync/push` | **Real** — 8 entity types |
| Mobile `sync_queue` SQLite table | **Schema only** — no flush worker |
| Mobile API integration | **None** |
| Web offline | **None** — requires network |
| Conflict UI | **None** |

---

## 9. Notifications / reminders

| Item | Status |
|------|--------|
| `NotificationRule` model | Exists |
| `GET/PATCH /notifications/rules` | API only |
| `POST /notifications/snooze` | API only |
| BullMQ `scheduleBillReminder` | Code exists, **not called** from bill create |
| Redis worker | **Not implemented** |
| Push (mobile/web) | **None** |

### Needed reminders (all missing end-to-end)

Rent, bills, appointments, food/water, meds, pets, scary mail follow-up, payday planning, hyperfocus transition.

---

## 10. Security / privacy

| Control | Status | Dev OK? | Production? |
|---------|--------|---------|-------------|
| bcrypt password hashing | Yes | Yes | Yes |
| JWT access tokens | Yes | Yes | Needs short expiry + secrets rotation |
| Refresh tokens in DB | Yes | Yes | Needs secure httpOnly cookie on web |
| JwtAuthGuard on protected routes | Yes | Yes | Yes |
| Document local storage | `storage/documents/{userId}/` | Yes | Needs encryption at rest + access ACL |
| AES field encryption package | Exists | Rarely used | Needs key management |
| Audit logs | Yes | Yes | Needs retention policy |
| CORS LAN allowlist | Dev only | Yes | Lock down for prod |
| Env secrets | `.env` gitignored | Yes | Needs vault |
| Data export | `POST /profile/export` | Yes | Needs UI + rate limit |
| Account delete | `DELETE /profile` soft | Partial | Needs hard delete + doc wipe |
| Privacy mode | Profile field | Yes | Enforce in all AI paths |
| API tests | **None** | — | Blocker |
| Rate limiting | **None** | — | Blocker |
| File upload virus scan | **None** | — | Blocker for prod |

---

## Inventory counts

| Area | Count |
|------|-------|
| Web routes inventoried | **19** (+ 1 redirect) |
| API HTTP routes | **46** |
| Prisma models | **27** |
| AI specialist agents | **8** |
| Mobile screens | **8** |
| Design system components | **5** |
| Monorepo packages | **7** |
