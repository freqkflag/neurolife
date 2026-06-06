# NeuroLife Roadmap — Next Phases

Prioritized build sequence based on `APP_INVENTORY.md` and `GAP_ANALYSIS.md`.  
**Do not skip Phase 1** — several MVP screens look complete but lack persistence or extraction depth.

---

## Phase 1: Make current MVP actually usable

**Goal:** Every sidebar tab does something real that survives refresh.

| # | Deliverable | Routes / areas |
|---|-------------|----------------|
| 1.1 | ~~PDF + image OCR/text extraction pipeline~~ **Done (MVP)** — `pdf-parse` + `tesseract.js`; scanned PDFs TODO | `POST /documents/:id/extract`, `/analyze`, `GET /extractions` |
| 1.2 | Bill mark-paid, edit, delete | `/bills`, `/budget/payday-planner` |
| 1.3 | Wire `/disability` to admin disability API + symptom timeline stub | `/disability` |
| 1.4 | Merge or wire `/groceries` + `/pantry` into `/food` | Food routes |
| 1.5 | Crisis checklist persistence + support contacts | `/crisis`, Profile |
| 1.6 | Weekly review API endpoint + persistence | `/weekly-review` |
| 1.7 | Document download + delete | `/documents` |
| 1.8 | AI consent checkbox on scary mail + documents | Privacy UX |
| 1.9 | Basic API integration tests for auth, budget, documents | **Partial** — documents smoke tests in `apps/api/test/` |

**Exit criteria:** User can upload a PDF, see pending/extracted state, manage bills through payday, and no sidebar tab is a static placeholder.

---

## Phase 2: Complete web command center

**Goal:** Full life-management surface on web/tablet.

| # | Deliverable |
|---|-------------|
| 2.1 | Subscriptions + debts + income sources UI |
| 2.2 | Appointments page + prep cards |
| 2.3 | Admin task status workflow (done/snooze) |
| 2.4 | Routine builder (multi-step) + routine runner |
| 2.5 | Theme selector + quiet hours in settings |
| 2.6 | Notification rules UI in settings |
| 2.7 | Dashboard v2: appointments, sensory, scary mail queue |
| 2.8 | Account export + delete UI |
| 2.9 | Refresh token silent renew on web |

**Exit criteria:** All Prisma models used by at least one UI or documented as deferred.

---

## Phase 3: Build mobile rescue/regulation app (NeuroLife Pocket)

**Goal:** Pocket app connects to the same life data while staying offline-capable.

| # | Deliverable |
|---|-------------|
| 3.1 | API auth + token storage (secure) |
| 3.2 | Sync pull/push worker using `sync_queue` |
| 3.3 | Bundle EDM/audio assets or remote CDN |
| 3.4 | On-device LLM model download + settings |
| 3.5 | Real sensor hooks (screen time, optional HealthKit) |
| 3.6 | Push notifications for hyperfocus transition |
| 3.7 | Crisis screen with offline fallbacks + contact dial |
| 3.8 | Brain dump sync to web tasks |

**Exit criteria:** Complete a brain dump on phone, see task appear on web after sync.

---

## Phase 4: Add specialized AI depth

**Goal:** Agents produce actionable structured output, not generic stubs.

| # | Deliverable |
|---|-------------|
| 4.1 | Self-hosted AI provider deployment guide + wiring |
| 4.2 | Rich `cards` rendering on all AI surfaces |
| 4.3 | Budget agent → payday shortage recommendations |
| 4.4 | Disability agent on `/disability` |
| 4.5 | Crisis agent on `/crisis` with guardrails |
| 4.6 | RSD agent on web + mobile parity |
| 4.7 | AI interaction history viewer (privacy-safe) |
| 4.8 | Per-document consent audit trail |

**Exit criteria:** Scary mail analyze returns deadline + action cards reliably for TXT and PDF.

---

## Phase 5: Sync, offline, notifications

**Goal:** Reliable cross-device life OS with calm reminders.

| # | Deliverable |
|---|-------------|
| 5.1 | Notification worker (BullMQ) + delivery adapter |
| 5.2 | Bill due reminders (3-day lead) |
| 5.3 | Rent + payday reminders |
| 5.4 | Appointment prep reminders |
| 5.5 | Scary mail follow-up reminder |
| 5.6 | Food/water/meds/pet check-in nudges |
| 5.7 | Sync conflict UI on web |
| 5.8 | Offline read cache for critical web pages |

**Exit criteria:** User receives a bill reminder on device and can snooze from settings.

---

## Phase 6: Production hardening

**Goal:** Safe to deploy beyond homelab.

| # | Deliverable |
|---|-------------|
| 6.1 | Test suite: API e2e + web smoke |
| 6.2 | Encrypt documents at rest (or S3 SSE) |
| 6.3 | httpOnly refresh cookies |
| 6.4 | Rate limiting + upload scanning |
| 6.5 | Secrets management + env validation |
| 6.6 | Structured logging + error tracking |
| 6.7 | Backup/restore runbooks |
| 6.8 | HTTPS reverse proxy + hardened CORS |
| 6.9 | GDPR-style delete (hard wipe documents) |
| 6.10 | Security audit checklist |

**Exit criteria:** `verify-dev.sh` equivalent passes in CI; staging deploy documented.

---

## Recommended immediate focus (next 2 sprints)

1. **Document OCR/PDF pipeline** — unlocks scary mail for real users  
2. **Bill lifecycle (paid/edit/delete)** — unlocks money trust  
3. **Stub page cleanup** — disability, groceries, pantry  
4. **Crisis persistence + contacts** — safety credibility  
5. **API smoke tests** — protect MVP velocity  
