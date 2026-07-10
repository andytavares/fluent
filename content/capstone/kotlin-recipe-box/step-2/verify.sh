#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a recipe with all fields returns 201 with the inserted row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Pancakes","ingredients":["flour","milk","eggs"],"minutes":20}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/recipes)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"Pancakes"' /tmp/create_body \
  && grep -q '"flour"' /tmp/create_body \
  && grep -q '"minutes"[[:space:]]*:[[:space:]]*20' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: creating a recipe without minutes returns 201 with minutes null.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Salad","ingredients":["lettuce"]}' \
  -o /tmp/create_nominutes_body -w '%{http_code}' http://localhost:8080/recipes)
PASS2=false
if [ "$RESP2" = "201" ] && grep -q '"minutes"[[:space:]]*:[[:space:]]*null' /tmp/create_nominutes_body; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing/empty ingredients array returns 400.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Nothing","ingredients":[]}' \
  -o /tmp/create_bad_body -w '%{http_code}' http://localhost:8080/recipes)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes\",\"status\":$RESP3,\"passed\":$PASS3}"
