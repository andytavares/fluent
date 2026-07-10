#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: deleting a "done" task succeeds with 204 and an empty body.
RESP1=$(curl -s -X DELETE -o /tmp/delete_ok_body -w '%{http_code}' http://localhost:8080/tasks/1)
PASS1=false
if [ "$RESP1" = "204" ] && [ ! -s /tmp/delete_ok_body ]; then
  PASS1=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/tasks/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: deleting an unfinished task ("in_progress") is rejected with 409.
RESP2=$(curl -s -X DELETE -o /tmp/delete_unfinished_body -w '%{http_code}' http://localhost:8080/tasks/2)
PASS2=false
if [ "$RESP2" = "409" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"task not finished"' /tmp/delete_unfinished_body; then
  PASS2=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/tasks/2\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: deleting a nonexistent id returns 404 with an error body.
RESP3=$(curl -s -X DELETE -o /tmp/delete_missing_body -w '%{http_code}' http://localhost:8080/tasks/9999)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/delete_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/tasks/9999\",\"status\":$RESP3,\"passed\":$PASS3}"
