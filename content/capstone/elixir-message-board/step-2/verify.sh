#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a new channel returns 201 with the inserted row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"random"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/channels)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"random"' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"created_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: creating a channel with a name that already exists (seeded
# "general") returns 409 with an error body.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"general"}' \
  -o /tmp/create_dup_body -w '%{http_code}' http://localhost:8080/channels)
PASS2=false
if [ "$RESP2" = "409" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"channel exists"' /tmp/create_dup_body; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing required field (name) returns 400.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/channels)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels\",\"status\":$RESP3,\"passed\":$PASS3}"
