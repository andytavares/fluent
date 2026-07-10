#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: fetching the latest reading for a seeded sensor returns the
# most recent row by taken_at, not the first-inserted one.
RESP1=$(curl -s -o /tmp/latest_found_body -w '%{http_code}' http://localhost:8080/sensors/temp-1/latest)
PASS1=false
if [ "$RESP1" = "200" ] && grep -q '"value_milli"[[:space:]]*:[[:space:]]*22000' /tmp/latest_found_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors/temp-1/latest\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a sensor with no readings returns 404 with an error body.
RESP2=$(curl -s -o /tmp/latest_missing_body -w '%{http_code}' http://localhost:8080/sensors/temp-99/latest)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/latest_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors/temp-99/latest\",\"status\":$RESP2,\"passed\":$PASS2}"
