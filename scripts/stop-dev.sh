#!/usr/bin/env bash
# Stop NeuroLife dev servers on ports 3000, 3001, and 8082.
set -euo pipefail

stop_port() {
  local port="$1"
  local pids
  pids="$(ss -tlnp 2>/dev/null | grep ":${port} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u || true)"
  if [[ -z "$pids" ]]; then
    echo "Port ${port}: not listening"
    return
  fi
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
    echo "Port ${port}: stopped pid ${pid}"
  done
}

for port in 3000 3001 8082; do
  stop_port "$port"
done

echo "Dev stack stop complete."
