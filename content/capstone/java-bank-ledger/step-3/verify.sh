#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: a non-positive deposit amount returns 400.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"amount_cents":0}' \
  -o /tmp/deposit_bad_body -w '%{http_code}' http://localhost:8080/accounts/1/deposit)
PASS1=false
if [ "$RESP1" = "400" ]; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts/1/deposit\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a valid deposit of 500 on a starting balance of 1000 returns 1500.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"amount_cents":500}' \
  -o /tmp/deposit_ok_body -w '%{http_code}' http://localhost:8080/accounts/1/deposit)
PASS2=false
if [ "$RESP2" = "200" ] && grep -q '"balance_cents"[[:space:]]*:[[:space:]]*1500' /tmp/deposit_ok_body; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts/1/deposit\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: withdrawing more than the balance (1500) returns 409 and no write happens.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"amount_cents":999999}' \
  -o /tmp/withdraw_over_body -w '%{http_code}' http://localhost:8080/accounts/1/withdraw)
PASS3=false
if [ "$RESP3" = "409" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"insufficient funds"' /tmp/withdraw_over_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts/1/withdraw\",\"status\":$RESP3,\"passed\":$PASS3}"

# Check 4: a valid withdrawal of 500 from 1500 returns 1000.
RESP4=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"amount_cents":500}' \
  -o /tmp/withdraw_ok_body -w '%{http_code}' http://localhost:8080/accounts/1/withdraw)
PASS4=false
if [ "$RESP4" = "200" ] && grep -q '"balance_cents"[[:space:]]*:[[:space:]]*1000' /tmp/withdraw_ok_body; then
  PASS4=true
fi
echo "{\"method\":\"POST\",\"path\":\"/accounts/1/withdraw\",\"status\":$RESP4,\"passed\":$PASS4}"
