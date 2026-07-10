#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: a legal transition (todo -> in_progress) succeeds.
RESP1=$(curl -s -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}' \
  -o /tmp/patch_ok_body -w '%{http_code}' http://localhost:8080/tasks/1/status)
PASS1=false
if [ "$RESP1" = "200" ] && grep -q '"status"[[:space:]]*:[[:space:]]*"in_progress"' /tmp/patch_ok_body; then
  PASS1=true
fi
echo "{\"method\":\"PATCH\",\"path\":\"/tasks/1/status\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: skipping a state (todo -> done) is rejected with 409.
RESP2=$(curl -s -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"done"}' \
  -o /tmp/patch_skip_body -w '%{http_code}' http://localhost:8080/tasks/2/status)
PASS2=false
if [ "$RESP2" = "409" ] \
  && grep -q '"error"[[:space:]]*:[[:space:]]*"invalid transition"' /tmp/patch_skip_body \
  && grep -q '"from"[[:space:]]*:[[:space:]]*"todo"' /tmp/patch_skip_body \
  && grep -q '"to"[[:space:]]*:[[:space:]]*"done"' /tmp/patch_skip_body; then
  PASS2=true
fi
echo "{\"method\":\"PATCH\",\"path\":\"/tasks/2/status\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: reversing a transition (in_progress -> todo, task 1 was moved
# to in_progress by Check 1) is rejected with 409.
RESP3=$(curl -s -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"todo"}' \
  -o /tmp/patch_back_body -w '%{http_code}' http://localhost:8080/tasks/1/status)
PASS3=false
if [ "$RESP3" = "409" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"invalid transition"' /tmp/patch_back_body; then
  PASS3=true
fi
echo "{\"method\":\"PATCH\",\"path\":\"/tasks/1/status\",\"status\":$RESP3,\"passed\":$PASS3}"

# Check 4: an unknown status value returns 400.
RESP4=$(curl -s -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"blocked"}' \
  -o /tmp/patch_bad_body -w '%{http_code}' http://localhost:8080/tasks/2/status)
PASS4=false
if [ "$RESP4" = "400" ] && grep -q '"allowed"' /tmp/patch_bad_body; then
  PASS4=true
fi
echo "{\"method\":\"PATCH\",\"path\":\"/tasks/2/status\",\"status\":$RESP4,\"passed\":$PASS4}"
