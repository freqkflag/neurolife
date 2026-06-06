#!/usr/bin/env bash
# Quick health checks for the NeuroLife dev stack.
set -euo pipefail

LAN_IP="${DEV_LAN_IP:-$(hostname -I | awk '{print $1}')}"

check_url() {
  local label="$1"
  local url="$2"
  if curl -sf --max-time 5 "$url" >/dev/null 2>&1; then
    echo "OK  ${label}: ${url}"
    return 0
  fi
  echo "FAIL ${label}: ${url}"
  return 1
}

failed=0

echo "=== Ports ==="
ss -tlnp 2>/dev/null | grep -E ':(3000|3001|8082)\s' || {
  echo "No NeuroLife dev ports are listening"
  failed=1
}

echo ""
echo "=== HTTP ==="
check_url "Web (localhost)" "http://127.0.0.1:3000" || failed=1
check_url "API health (localhost)" "http://127.0.0.1:3001/health" || failed=1

if [[ -n "$LAN_IP" ]]; then
  check_url "Web (LAN)" "http://${LAN_IP}:3000" || failed=1
  check_url "API health (LAN)" "http://${LAN_IP}:3001/health" || failed=1
fi

exit "$failed"
