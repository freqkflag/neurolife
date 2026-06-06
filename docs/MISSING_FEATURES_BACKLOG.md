# Missing Features Backlog

Checklist grouped by product area. Use with `ROADMAP_NEXT.md` for sequencing.  
Legend: `[ ]` not started · `[~]` partial · `[x]` done

---

## Budget / money

- [~] Current balance update (`POST /budget/balance`)
- [~] Safe-to-spend calculation
- [~] Payday planner (save plan, surplus/shortage)
- [ ] Bill mark as paid
- [ ] Bill edit / delete
- [ ] Subscriptions tracker UI
- [ ] Debt tracker UI
- [ ] Income sources UI
- [ ] Pawn loan tracker
- [ ] Savings goals
- [ ] Spending categories
- [ ] Transactions list
- [ ] Budget accounts (multi-account)
- [ ] Emergency shortfall field in UI
- [ ] Money stress level input
- [ ] Payday reminder notification

---

## Bills / subscriptions / debt

- [~] Add bill (web)
- [ ] Protected category auto-flag UI feedback
- [ ] Recurring bill templates
- [ ] Subscription CRUD API + UI
- [ ] Debt minimum payment tracker
- [ ] Bill payment history
- [ ] Bill reminder scheduling (wire `scheduleBillReminder`)

---

## Documents / scary mail

- [x] File upload (TXT, MD, PDF, PNG, JPG)
- [x] Metadata (title, type, deadline, notes)
- [x] Analyze TXT/MD via admin_paperwork agent (structured cards)
- [x] PDF text extraction (`pdf-parse` — text-layer PDFs)
- [x] Image OCR (`tesseract.js` — PNG/JPG)
- [x] Extract + analyze API (`POST /extract`, `POST /analyze`, `GET /extractions`)
- [x] Scary mail paste analysis (`POST /documents/analyze-text`)
- [ ] Scanned PDF OCR (image-only PDFs without text layer)
- [ ] Document download
- [ ] Document delete (soft + file wipe)
- [ ] Link document → admin task
- [ ] Scary mail follow-up reminder
- [ ] AI consent UI before analyze
- [ ] S3/MinIO production storage path
- [ ] Encrypted storage at rest

---

## Admin / disability / benefits

- [~] Admin tasks list + create
- [~] Disability notes list + create (under `/admin`)
- [ ] Standalone `/disability` page
- [ ] Symptom timeline CRUD
- [ ] Admin task status (done/snooze)
- [ ] Document-linked admin tasks
- [ ] Disability benefits AI specialist UI
- [ ] Provider appointment prep integration

---

## Food / body needs

- [~] Grocery list add (via `/food`)
- [~] Pantry read (via `/food`)
- [~] Low-spoon meal suggestions API
- [ ] Standalone `/groceries` page
- [ ] Standalone `/pantry` page
- [ ] Pantry item add/edit
- [ ] Meal plan builder UI
- [ ] Diabetes-aware meal flag (profile field exists)
- [ ] Food/water reminder notifications
- [ ] Medication reminders (profile flag exists)

---

## Housing / transportation

- [~] Housing items CRUD
- [~] Rent countdown from profile
- [ ] Utility bill tracking integration
- [ ] Move checklist workflow
- [ ] Maintenance request tracker
- [ ] Transportation / leaving checklist on web

---

## Tasks / routines

- [~] Task list + create + complete
- [~] Routine create (single step)
- [ ] Task edit / delete
- [ ] Task due date sorting / filtering
- [ ] Capacity-based task filtering on web
- [ ] Routine multi-step editor
- [ ] Routine runner (step-by-step)
- [ ] Pinned tasks on dashboard
- [ ] Brain dump → task (mobile → web sync)

---

## Crisis / stabilization

- [~] Crisis checklist UI (client-only)
- [ ] Checklist persistence
- [ ] Crisis AI agent integration
- [ ] Support contacts from API
- [ ] Emergency contact quick-dial
- [ ] Grounding exercise timer
- [ ] Link to mobile stabilize flow
- [ ] Crisis event logging (privacy-safe)

---

## Mobile regulation (Pocket)

- [~] Dashboard with capacity + stuck button
- [~] Haptic patterns
- [~] Local AI fallbacks
- [~] SQLite offline cache
- [~] Brain dump capture
- [ ] API authentication
- [ ] Sync engine client
- [ ] Bundled audio/EDM assets
- [ ] On-device LLM model setup
- [ ] Real ambient noise/light sensors
- [ ] Wearable HRV/sleep integration
- [ ] Push notifications
- [ ] Hyperfocus transition haptics (wired end-to-end)

---

## AI specialists

- [~] AIOrchestrator + 8 agents (stub default)
- [~] `/ai/chat` endpoint
- [~] Intent classification
- [~] Privacy router
- [ ] Cloud provider production config
- [ ] Self-hosted provider deployment
- [ ] Structured cards on all AI pages
- [ ] Budget agent → payday insights
- [ ] Disability agent page
- [ ] Crisis agent page
- [ ] RSD agent on web
- [ ] Food/housing agents on relevant pages
- [ ] AI history viewer
- [ ] Per-request consent UI

---

## Sync / offline

- [~] SyncEngine library
- [~] API pull/push (8 entity types)
- [~] Mobile sync_queue table
- [ ] Mobile sync worker
- [ ] Web offline cache
- [ ] Conflict resolution UI
- [ ] Deleted entity tombstone sync
- [ ] Background sync on app resume

---

## Notifications

- [~] NotificationRule model + API
- [~] Bill reminder enqueue (unused)
- [ ] BullMQ worker process
- [ ] Push notification delivery
- [ ] Email/SMS adapter (optional)
- [ ] Rent reminder
- [ ] Appointment reminder
- [ ] Payday planning reminder
- [ ] Scary mail follow-up
- [ ] Food/water/meds/pet nudges
- [ ] Hyperfocus transition alert
- [ ] Notification preferences UI

---

## Security / privacy

- [x] bcrypt passwords
- [x] JWT auth guard
- [~] Refresh tokens
- [~] Audit logs
- [~] Privacy mode on profile
- [~] Document upload size/type limits
- [ ] API rate limiting
- [ ] httpOnly refresh cookies
- [ ] Document encryption at rest
- [ ] Secrets rotation
- [ ] Account hard delete + data wipe
- [ ] Export UI with redaction options
- [ ] Upload malware scanning
- [ ] Production CORS lockdown
- [ ] Automated security tests

---

## UX / design

- [x] Global dark theme (mutedDark)
- [x] AppShell + sidebar layout
- [x] MVP PageShell pattern
- [~] Design system components (5 of N)
- [ ] Theme selector (softCream)
- [ ] Mobile navigation pattern
- [ ] Consistent empty states on all pages
- [ ] Loading/error calm banners
- [ ] Form validation messages
- [ ] Accessibility audit (WCAG)
- [ ] Remove duplicate stub routes or redirect them
