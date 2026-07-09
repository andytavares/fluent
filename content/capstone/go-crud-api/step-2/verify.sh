#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a user with valid fields returns 201 with the inserted row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Bob","email":"bob@example.com"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/users)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"Bob"' /tmp/create_body \
  && grep -q '"email"[[:space:]]*:[[:space:]]*"bob@example.com"' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"created_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/users\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (email) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"NoEmail"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/users)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/users\",\"status\":$RESP2,\"passed\":$PASS2}"
