#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: a partial update (tags only) returns 200 with the full record —
# title/body unchanged, tags updated, created_at preserved, updated_at
# bumped away from its seeded value.
RESP1=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"tags":["home","shopping","urgent"]}' \
  -o /tmp/put_body -w '%{http_code}' http://localhost:8080/notes/1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Grocery list"' /tmp/put_body \
  && grep -q '"body"[[:space:]]*:[[:space:]]*"Milk, eggs, bread"' /tmp/put_body \
  && grep -q '"urgent"' /tmp/put_body \
  && grep -q '"created_at"[[:space:]]*:[[:space:]]*"2026-06-01' /tmp/put_body \
  && ! grep -q '"updated_at"[[:space:]]*:[[:space:]]*"2026-06-01' /tmp/put_body; then
  PASS1=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/notes/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: updating a nonexistent id returns 404 with an error body.
RESP2=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"title":"Nope"}' \
  -o /tmp/put_missing_body -w '%{http_code}' http://localhost:8080/notes/9999)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/put_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/notes/9999\",\"status\":$RESP2,\"passed\":$PASS2}"
