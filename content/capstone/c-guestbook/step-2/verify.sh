#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: signing the guestbook with valid fields returns 201 with the
# inserted row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Bob","message":"Great site!"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/entries)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"Bob"' /tmp/create_body \
  && grep -q '"message"[[:space:]]*:[[:space:]]*"Great site!"' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"created_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/entries\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (message) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"NoMessage"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/entries)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/entries\",\"status\":$RESP2,\"passed\":$PASS2}"
