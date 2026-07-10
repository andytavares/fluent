#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: purging a sensor with three seeded readings returns the deleted
# count.
RESP1=$(curl -s -X DELETE -o /tmp/purge_body -w '%{http_code}' http://localhost:8080/sensors/temp-1)
PASS1=false
if [ "$RESP1" = "200" ] && grep -q '"deleted"[[:space:]]*:[[:space:]]*3' /tmp/purge_body; then
  PASS1=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/sensors/temp-1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: purging a sensor with no readings returns 404 with an error body.
RESP2=$(curl -s -X DELETE -o /tmp/purge_missing_body -w '%{http_code}' http://localhost:8080/sensors/temp-99)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/purge_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/sensors/temp-99\",\"status\":$RESP2,\"passed\":$PASS2}"
