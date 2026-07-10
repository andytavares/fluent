#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: fetching an active key (seeded by fixtures.sql) returns 200.
RESP1=$(curl -s -o /tmp/get_found_body -w '%{http_code}' http://localhost:8080/kv/greeting)
PASS1=false
if [ "$RESP1" = "200" ] && grep -q '"value"[[:space:]]*:[[:space:]]*"hello world"' /tmp/get_found_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/greeting\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: fetching an already-expired key returns 404, same as a missing key.
RESP2=$(curl -s -o /tmp/get_expired_body -w '%{http_code}' http://localhost:8080/kv/stale)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/get_expired_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/stale\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: fetching a key that never existed returns 404.
RESP3=$(curl -s -o /tmp/get_missing_body -w '%{http_code}' http://localhost:8080/kv/missing)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/get_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/missing\",\"status\":$RESP3,\"passed\":$PASS3}"
