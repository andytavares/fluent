#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

RESP=$(curl -s -o /tmp/count_body -w '%{http_code}' http://localhost:8080/count)
PASS=false
if [ "$RESP" = "200" ] && grep -q '"count"[[:space:]]*:[[:space:]]*7' /tmp/count_body; then
  PASS=true
fi
echo "{\"method\":\"GET\",\"path\":\"/count\",\"status\":$RESP,\"passed\":$PASS}"
