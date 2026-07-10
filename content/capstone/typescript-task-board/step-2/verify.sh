#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a task with only a title defaults status to "todo".
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Write launch checklist"}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/tasks)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Write launch checklist"' /tmp/create_body \
  && grep -q '"status"[[:space:]]*:[[:space:]]*"todo"' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/tasks\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (title) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"assignee":"Priya"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/tasks)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/tasks\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: an invalid status value returns 400 listing allowed values.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Bad status task","status":"blocked"}' \
  -o /tmp/create_badstatus_body -w '%{http_code}' http://localhost:8080/tasks)
PASS3=false
if [ "$RESP3" = "400" ] && grep -q '"allowed"' /tmp/create_badstatus_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/tasks\",\"status\":$RESP3,\"passed\":$PASS3}"
