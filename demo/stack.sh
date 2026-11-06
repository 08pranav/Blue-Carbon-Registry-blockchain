#!/usr/bin/env bash
# Start or stop a fresh local stack for recording the demo:
#   demo/stack.sh start   new Hardhat chain + deploy + empty backend + frontend on the local chain
#   demo/stack.sh stop    stop everything and remove the generated .env.local
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN="$ROOT/demo/.run"
mkdir -p "$RUN"

stop() {
  # kill whatever listens on the stack's ports (reliable, unlike matching process names)
  for port in 8080 3001 8545; do
    pids=$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null || true)
    [ -n "$pids" ] && kill $pids 2>/dev/null || true
  done
  pkill -f "hardhat node" 2>/dev/null || true
  sleep 1
  rm -f "$RUN"/*.pid "$ROOT/.env.local" "$ROOT/blockchain-deployment/deployments/localhost.json"
  rm -rf "$RUN/uploads"
}

wait_for() { # url, label
  for _ in $(seq 1 60); do curl -s -o /dev/null "$1" && return 0; sleep 1; done
  echo "timed out waiting for $2" >&2; exit 1
}

case "${1:-}" in
  stop) stop; echo "stack stopped" ;;
  start)
    stop
    ( cd "$ROOT/blockchain-deployment" && nohup npx hardhat node > "$RUN/node.log" 2>&1 < /dev/null & echo $! > "$RUN/node.pid" )
    for _ in $(seq 1 60); do grep -q "Started HTTP" "$RUN/node.log" 2>/dev/null && break; sleep 1; done
    ( cd "$ROOT/blockchain-deployment" && npm run deploy:local > "$RUN/deploy.log" 2>&1 )
    ( cd "$ROOT/backend" && UPLOADS_DIR="$RUN/uploads" nohup node server.js > "$RUN/backend.log" 2>&1 < /dev/null & echo $! > "$RUN/backend.pid" )
    ( cd "$ROOT" && nohup npm run dev > "$RUN/vite.log" 2>&1 < /dev/null & echo $! > "$RUN/vite.pid" )
    wait_for http://localhost:8080/ frontend
    wait_for http://localhost:3001/api/health backend
    # prove the state is fresh: sample projects only, no trades, a young chain
    curl -s localhost:3001/api/health | grep -q '"projects":2,.*"transactions":0' || { echo "backend is not fresh" >&2; exit 1; }
    BLOCK=$(curl -s -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' http://127.0.0.1:8545 | sed 's/.*"result":"\(0x[0-9a-f]*\)".*/\1/')
    [ "$((BLOCK))" -le 5 ] || { echo "chain is not fresh (block $((BLOCK)))" >&2; exit 1; }
    echo "stack ready: frontend http://localhost:8080  backend :3001  chain :8545 (see demo/.run/*.log)"
    grep -E "CarbonCreditToken|Marketplace" "$RUN/deploy.log" | head -2 ;;
  *) echo "usage: $0 start|stop" >&2; exit 1 ;;
esac
