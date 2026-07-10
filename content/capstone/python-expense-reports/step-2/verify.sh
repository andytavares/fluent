#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating an expense with valid fields returns 201 with the
# inserted row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"category":"food","amount_cents":1250,"note":"Lunch with team","spent_on":"2026-06-15"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/expenses)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"category"[[:space:]]*:[[:space:]]*"food"' /tmp/create_body \
  && grep -q '"amount_cents"[[:space:]]*:[[:space:]]*1250' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"created_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/expenses\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (amount_cents) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"category":"food","spent_on":"2026-06-15"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/expenses)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/expenses\",\"status\":$RESP2,\"passed\":$PASS2}"
