#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: aggregating a seeded sensor's readings returns exact count/min/
# max/avg values.
RESP1=$(curl -s -o /tmp/stats_found_body -w '%{http_code}' http://localhost:8080/sensors/temp-1/stats)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"count"[[:space:]]*:[[:space:]]*3' /tmp/stats_found_body \
  && grep -q '"min_milli"[[:space:]]*:[[:space:]]*20000' /tmp/stats_found_body \
  && grep -q '"max_milli"[[:space:]]*:[[:space:]]*22000' /tmp/stats_found_body \
  && grep -q '"avg_milli"[[:space:]]*:[[:space:]]*21000' /tmp/stats_found_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors/temp-1/stats\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a sensor with no readings returns 404 with an error body.
RESP2=$(curl -s -o /tmp/stats_missing_body -w '%{http_code}' http://localhost:8080/sensors/temp-99/stats)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/stats_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors/temp-99/stats\",\"status\":$RESP2,\"passed\":$PASS2}"
