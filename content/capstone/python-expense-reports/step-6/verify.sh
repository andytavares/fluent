#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: June 2026 report returns the correct total and per-category
# breakdown, excluding the May 2026 and June 2025 rows.
RESP1=$(curl -s -o /tmp/monthly_body -w '%{http_code}' 'http://localhost:8080/reports/monthly?year=2026&month=6')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"year"[[:space:]]*:[[:space:]]*2026' /tmp/monthly_body \
  && grep -q '"month"[[:space:]]*:[[:space:]]*6' /tmp/monthly_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*2300' /tmp/monthly_body \
  && grep -q '"category"[[:space:]]*:[[:space:]]*"food"' /tmp/monthly_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*2000' /tmp/monthly_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*300' /tmp/monthly_body \
  && ! grep -q '9999' /tmp/monthly_body \
  && ! grep -q '5000' /tmp/monthly_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/reports/monthly?year=2026&month=6\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an invalid month (13) returns 400.
RESP2=$(curl -s -o /tmp/monthly_bad_body -w '%{http_code}' 'http://localhost:8080/reports/monthly?year=2026&month=13')
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/reports/monthly?year=2026&month=13\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing month param returns 400.
RESP3=$(curl -s -o /tmp/monthly_missing_body -w '%{http_code}' 'http://localhost:8080/reports/monthly?year=2026')
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/reports/monthly?year=2026\",\"status\":$RESP3,\"passed\":$PASS3}"
