#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

RESP=$(curl -s -o /tmp/recent_body -w '%{http_code}' http://localhost:8080/entries/recent)
COUNT=$(grep -o '"id"[[:space:]]*:' /tmp/recent_body | wc -l | tr -d ' ')
PASS=false
if [ "$RESP" = "200" ] \
  && [ "$COUNT" = "5" ] \
  && grep -q '"entries"[[:space:]]*:[[:space:]]*\[[[:space:]]*{"id"[[:space:]]*:[[:space:]]*8' /tmp/recent_body \
  && ! grep -q '"name"[[:space:]]*:[[:space:]]*"Visitor One"' /tmp/recent_body; then
  PASS=true
fi
echo "{\"method\":\"GET\",\"path\":\"/entries/recent\",\"status\":$RESP,\"passed\":$PASS}"
