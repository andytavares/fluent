#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

RESP=$(curl -s -o /tmp/health_body -w '%{http_code}' http://localhost:8080/health)
PASS=false
if [ "$RESP" = "200" ] && grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' /tmp/health_body; then
  PASS=true
fi
echo "{\"method\":\"GET\",\"path\":\"/health\",\"status\":$RESP,\"passed\":$PASS}"
