#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

RESP=$(curl -s -o /tmp/categories_body -w '%{http_code}' http://localhost:8080/reports/categories)

# Check 1: correct totals and counts per category (seeded by fixtures.sql).
PASS1=false
if [ "$RESP" = "200" ] \
  && grep -q '"category"[[:space:]]*:[[:space:]]*"food"' /tmp/categories_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*2500' /tmp/categories_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*1500' /tmp/categories_body \
  && grep -q '"total_cents"[[:space:]]*:[[:space:]]*1000' /tmp/categories_body \
  && grep -q '"count"[[:space:]]*:[[:space:]]*3' /tmp/categories_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/reports/categories\",\"status\":$RESP,\"passed\":$PASS1}"

# Check 2: categories are ordered by total_cents descending — food (2500)
# before entertainment (1500) before transport (1000).
POS_FOOD=$(grep -bo '"food"' /tmp/categories_body | head -1 | cut -d: -f1)
POS_ENT=$(grep -bo '"entertainment"' /tmp/categories_body | head -1 | cut -d: -f1)
POS_TRANSPORT=$(grep -bo '"transport"' /tmp/categories_body | head -1 | cut -d: -f1)
PASS2=false
if [ "$RESP" = "200" ] \
  && [ -n "$POS_FOOD" ] && [ -n "$POS_ENT" ] && [ -n "$POS_TRANSPORT" ] \
  && [ "$POS_FOOD" -lt "$POS_ENT" ] \
  && [ "$POS_ENT" -lt "$POS_TRANSPORT" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/reports/categories\",\"status\":$RESP,\"passed\":$PASS2}"
