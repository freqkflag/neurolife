# NeuroLife Gap Analysis

Companion to `APP_INVENTORY.md`. Prioritized gaps between intended product vision and current implementation.

---

## Critical missing features

| Gap | Impact | Where |
|-----|--------|-------|
| PDF/image text extraction for documents | Core scary-mail workflow blocked for most real mail | `documents.service.ts` — OCR/PDF TODO |
| Crisis page has no persistence or AI | Safety feature resets on refresh; no `crisis_stabilization` agent | `/crisis` |
| Mobile app not connected to API/sync | Two products, not one system | `apps/mobile` |
| No automated tests (API or web) | Regressions undetected | Entire repo |
| Bill edit/delete/mark-paid | Money data becomes stale | `/bills`, API |
| Notification delivery pipeline | Reminders don't reach users | `notifications.service.ts` |
| Production document storage security | Sensitive files on local disk unencrypted | `local-storage.service.ts` |

---

## High-priority missing features

| Gap | Notes |
|-----|-------|
| `/disability` standalone page | API exists at `/admin/disability`; page is placeholder |
| `/groceries` and `/pantry` stub pages | Duplicate of `/food` tabs; confuse navigation |
| Subscriptions, debts, income sources UI | DB models exist; no web surfaces |
| Appointments UI | Full API, zero web page |
| Weekly review API persistence | localStorage only — lost across devices |
| Theme selector in settings | Comment says "coming soon" |
| Support contacts in crisis flow | TODO in CrisisView |
| Web refresh token flow | Token expires; no silent refresh |
| Structured AI output cards | Most pages show summary only |
| Routine multi-step editor + runner | Create stores one step; no execution flow |
| Mobile audio assets | EDM engine references missing `asset:/audio/*.mp3` |
| Mobile on-device LLM setup UX | `llama.rn` configured but no model download path |

---

## Medium-priority missing features

| Gap | Notes |
|-----|-------|
| Document download/delete | Upload works; no retrieval UI |
| S3/MinIO upload path unused by web | `upload-url` exists; web uses local storage |
| Profile PATCH for payday/balance fields | Saved via `/budget/payday-plan` instead — OK but fragmented |
| Admin task status workflow | Create only; no done/snooze |
| Food pantry add/edit | Read-only in combined Food view |
| Meal plan UI | API `GET /food/meals` unused |
| Housing utilities/move workflows | Basic CRUD only |
| Dashboard appointments + sensory | Partial command center |
| Notification rules UI | API exists; settings doesn't expose |
| Sync conflict resolution UI | Backend only |
| Encryption on document content at rest | Package exists; not applied to files |
| Accessibility lint enforcement | a11y rules package unused |

---

## Low-priority polish

| Gap | Notes |
|-----|-------|
| Register account from web UI | API supports; no page |
| PauseButton / SensoryLoadIndicator unused | Design system orphans |
| Pawn loans, savings goals, spending categories | Schema only |
| Symptom timeline | Schema only |
| BudgetAccount model | Schema only |
| Mobile food-check depth | Single screen |
| Sidebar mobile nav | Hidden on small screens with no alternative |
| Percy/visual regression | Not set up |
| API OpenAPI/Swagger docs | Not generated |

---

## Broken or thin screens

| Screen | Issue |
|--------|-------|
| `/disability` | Title + one TinyNextActionCard; no data |
| `/groceries` | Static placeholder text |
| `/pantry` | Static placeholder text |
| `/crisis` | Checklist state lost on refresh; no API |
| `/weekly-review` | Browser-local only |
| `/routines` | Can't add multiple steps or run routine |
| Mobile audio flows | Will error without bundled assets |
| Specialist AI on dashboard | Works but returns generic stub text |

---

## Stubbed systems

| System | Reality today |
|--------|---------------|
| AI specialists (all 8) | Rule-based fallback unless OpenAI key + cloud consent |
| CloudProvider | Requires `OPENAI_API_KEY` |
| SelfHostedProvider | Requires `SELF_HOSTED_AI_URL` |
| LocalAIService (mobile) | Fallbacks unless llama model loaded |
| AudioSomaticService | Code paths exist; assets missing |
| SensorContextService | Motion real; noise/light hardcoded |
| BiometricCapacityService | No wearable integration |
| Notifications queue | BullMQ enqueue only; no worker |
| S3 StorageService | Presign works in dev; web bypasses |
| Sync mobile client | Queue table only |
| Encryption | Audit metadata only |

---

## Production blockers

1. **No test suite** — zero confidence for deploys
2. **JWT in localStorage** — XSS risk; need httpOnly cookies or secure storage
3. **Default dev secrets** — JWT refresh secret, encryption key fallbacks
4. **Document files unencrypted** on disk
5. **No rate limiting** on auth/upload/AI endpoints
6. **CORS** — dev LAN wildcard pattern too permissive for production
7. **No backup/restore** procedure for Postgres + document storage
8. **No monitoring/alerting** — health check only
9. **Soft delete incomplete** — documents on disk not wiped on user delete
10. **AI consent** — not consistently enforced in UI before cloud calls
11. **HTTPS/TLS** — not configured in dev scripts (required for prod)
12. **MinIO/S3** — production object storage strategy undefined
