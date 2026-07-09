#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: a partial update of an existing user returns 200 with the full,
# updated record (unchanged fields preserved, changed fields applied).
RESP1=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"email":"ada.lovelace@example.com"}' \
  -o /tmp/put_body -w '%{http_code}' http://localhost:8080/users/1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"email"[[:space:]]*:[[:space:]]*"ada.lovelace@example.com"' /tmp/put_body \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"Ada Lovelace"' /tmp/put_body; then
  PASS1=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/users/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: updating a nonexistent id returns 404 with an error body.
RESP2=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"email":"nobody@example.com"}' \
  -o /tmp/put_missing_body -w '%{http_code}' http://localhost:8080/users/9999)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/put_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/users/9999\",\"status\":$RESP2,\"passed\":$PASS2}"
