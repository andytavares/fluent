#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: deleting an existing expense returns 204 with an empty body.
RESP1=$(curl -s -X DELETE -o /tmp/delete_body -w '%{http_code}' http://localhost:8080/expenses/2)
PASS1=false
if [ "$RESP1" = "204" ] && [ ! -s /tmp/delete_body ]; then
  PASS1=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/expenses/2\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: deleting a nonexistent id returns 404 with an error body.
RESP2=$(curl -s -X DELETE -o /tmp/delete_missing_body -w '%{http_code}' http://localhost:8080/expenses/9999)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/delete_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"DELETE\",\"path\":\"/expenses/9999\",\"status\":$RESP2,\"passed\":$PASS2}"
