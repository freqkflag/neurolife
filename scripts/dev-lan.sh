#!/usr/bin/env bash
# Start the full NeuroLife dev stack bound for LAN access (headless homelab).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LAN_IP="${DEV_LAN_IP:-$(hostname -I | awk '{print $1}')}"

if [[ -z "$LAN_IP" ]]; then
  echo "Could not detect LAN IP. Set DEV_LAN_IP and retry." >&2
  exit 1
fi

export API_HOST="0.0.0.0"
export NEXT_PUBLIC_API_URL="http://${LAN_IP}:3001"
export CORS_ORIGIN="http://localhost:3000,http://${LAN_IP}:3000"

echo "NeuroLife LAN dev"
echo "  Web:   http://${LAN_IP}:3000"
echo "  API:   http://${LAN_IP}:3001/health"
echo "  Metro: ${LAN_IP}:8082"
echo ""
echo "From another device on the LAN, use the IP above — not localhost."
echo ""

exec pnpm turbo run dev
