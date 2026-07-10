#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: fetching an existing note (seeded by fixtures.sql) returns 200.
RESP1=$(curl -s -o /tmp/get_found_body -w '%{http_code}' http://localhost:8080/notes/1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Grocery list"' /tmp/get_found_body \
  && grep -q '"home"' /tmp/get_found_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: fetching a nonexistent id returns 404 with an error body.
RESP2=$(curl -s -o /tmp/get_missing_body -w '%{http_code}' http://localhost:8080/notes/9999)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/get_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes/9999\",\"status\":$RESP2,\"passed\":$PASS2}"
