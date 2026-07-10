#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: transferring 300 from account 1 (1000) to account 2 (500) succeeds
# and returns both updated balances (700 / 800).
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"from":1,"to":2,"amount_cents":300}' \
  -o /tmp/transfer_ok_body -w '%{http_code}' http://localhost:8080/transfers)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"from_balance_cents"[[:space:]]*:[[:space:]]*700' /tmp/transfer_ok_body \
  && grep -q '"to_balance_cents"[[:space:]]*:[[:space:]]*800' /tmp/transfer_ok_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/transfers\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: transferring more than account 2's balance (800) fails with 409,
# and neither account's balance changed as a result.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"from":2,"to":1,"amount_cents":999999}' \
  -o /tmp/transfer_fail_body -w '%{http_code}' http://localhost:8080/transfers)
BAL_FROM=$(curl -s http://localhost:8080/accounts/2)
BAL_TO=$(curl -s http://localhost:8080/accounts/1)
PASS2=false
if [ "$RESP2" = "409" ] \
  && grep -q '"error"[[:space:]]*:[[:space:]]*"insufficient funds"' /tmp/transfer_fail_body \
  && echo "$BAL_FROM" | grep -q '"balance_cents"[[:space:]]*:[[:space:]]*800' \
  && echo "$BAL_TO" | grep -q '"balance_cents"[[:space:]]*:[[:space:]]*700'; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/transfers\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: transferring to an unknown account returns 404.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"from":1,"to":9999,"amount_cents":100}' \
  -o /tmp/transfer_missing_body -w '%{http_code}' http://localhost:8080/transfers)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/transfer_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/transfers\",\"status\":$RESP3,\"passed\":$PASS3}"
