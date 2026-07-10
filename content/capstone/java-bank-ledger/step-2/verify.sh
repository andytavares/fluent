#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating an account with a valid owner returns 201 with a zero balance.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"owner":"Alice"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/accounts)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"owner"[[:space:]]*:[[:space:]]*"Alice"' /tmp/create_body \
  && grep -q '"balance_cents"[[:space:]]*:[[:space:]]*0' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (owner) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/accounts)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts\",\"status\":$RESP2,\"passed\":$PASS2}"
