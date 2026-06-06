# Privacy modes

NeuroLife is designed for **privacy-first** AuDHD support. Each user selects a `PrivacyMode` on their profile (stored in Postgres, enum in Prisma).

## Modes

| Mode | Data residency | AI behavior |
|------|----------------|-------------|
| `FULLY_LOCAL` | Device only (mobile SQLite); no cloud AI | Rule-based + on-device `llama.rn` |
| `SELF_HOSTED` | Your infrastructure (API + DB + MinIO) | Self-hosted HTTP endpoint (`SELF_HOSTED_AI_URL`) |
| `HYBRID` | Self-hosted data; optional cloud for non-sensitive prompts | Cloud only with explicit `consentGiven` per request |
| `CLOUD_ASSISTED` | Self-hosted data; cloud AI allowed when keys present | OpenAI via `OPENAI_API_KEY` when configured |

## Routing (`@neurolife/ai-core`)

`PrivacyRouter` and `PlatformRouter` choose a provider per request:

1. **Rule-based** — always available; no external network
2. **Self-hosted** — when `SELF_HOSTED_AI_URL` is set and mode allows
3. **Cloud** — when `OPENAI_API_KEY` is set and mode + consent allow

Mobile **rescue flows** (stabilize, crisis) are designed to work without cloud keys.

## API consent

`POST /ai/chat` accepts `consentGiven: boolean`. Required for cloud inference under `HYBRID`. Ignored or implied under `CLOUD_ASSISTED` when keys exist.

## Encryption

Sensitive profile and document fields use `@neurolife/encryption` with `ENCRYPTION_MASTER_KEY`. This is independent of AI mode but required for document metadata at rest.

## Deployment guidance

| Audience | Recommended mode |
|----------|------------------|
| Individual offline use | `FULLY_LOCAL` on Pocket |
| Homelab / self-hosters | `SELF_HOSTED` or `HYBRID` |
| Assisted setup with OpenAI | `CLOUD_ASSISTED` + rotated API keys |

Never commit real API keys or encryption secrets. Use `.env` locally and a secrets manager in production.

## Changing modes

Users update `privacyMode` via the profile API or settings UI. Changing mode does not automatically delete cloud AI interaction history — review `AIInteraction` retention policies before production launch.
