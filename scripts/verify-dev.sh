#!/usr/bin/env bash
# Full dev-stack verification: ports, HTTP, login, dashboard API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LAN_IP="${DEV_LAN_IP:-$(hostname -I | awk '{print $1}')}"
API_BASE="${VERIFY_API_URL:-http://127.0.0.1:3001}"

echo "=== 1. Port listeners ==="
ss -tlnp | grep -E ':(3000|3001|8082)\s' || {
  echo "FAIL: expected ports 3000, 3001, 8082 to be listening"
  exit 1
}

echo ""
echo "=== 2. HTTP smoke tests ==="
curl -sf --max-time 10 -I "http://127.0.0.1:3000" | head -1
curl -sf --max-time 10 "http://127.0.0.1:3001/health"
echo ""

if [[ -n "$LAN_IP" ]]; then
  curl -sf --max-time 10 -I "http://${LAN_IP}:3000" | head -1
  curl -sf --max-time 10 "http://${LAN_IP}:3001/health"
  echo ""
fi

echo "=== 3. Dev login + dashboard API ==="
TOKEN="$(curl -sf --max-time 10 -X POST "${API_BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@neurolife.local","password":"dev-neurolife"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"

if [[ -z "$TOKEN" ]]; then
  echo "FAIL: could not obtain access token for dev@neurolife.local"
  exit 1
fi
echo "OK  login returned access token"

for path in /capacity /budget/safe-to-spend /tasks; do
  curl -sf --max-time 10 -H "Authorization: Bearer ${TOKEN}" "${API_BASE}${path}" >/dev/null
  echo "OK  ${path}"
done

echo ""
echo "All dev verification checks passed."
