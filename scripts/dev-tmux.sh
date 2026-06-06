#!/usr/bin/env bash
# Start NeuroLife LAN dev in a detached tmux session (persistent on headless homelab).
set -euo pipefail

SESSION="${NEUROLIFE_TMUX_SESSION:-neurolife}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed. Install with: sudo apt install tmux" >&2
  exit 1
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '${SESSION}' already exists."
  echo "Attach: tmux attach -t ${SESSION}"
  echo "Stop:   pnpm stop:dev && tmux kill-session -t ${SESSION}"
  exit 0
fi

tmux new-session -d -s "$SESSION" -c "$ROOT" "bash scripts/dev-lan.sh"
echo "Started NeuroLife dev in tmux session '${SESSION}'."
echo "Attach: tmux attach -t ${SESSION}"
echo "Detach: Ctrl+b then d"
LAN_IP="${DEV_LAN_IP:-$(hostname -I | awk '{print $1}')}"
echo "Web:    http://${LAN_IP}:3000"
