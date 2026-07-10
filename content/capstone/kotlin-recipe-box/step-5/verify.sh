#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: searching for "butter" returns both matching recipes, name-ordered
# ("Butter Cookies" before "Toast"), and excludes "Salad".
RESP1=$(curl -s -o /tmp/search_body -w '%{http_code}' 'http://localhost:8080/recipes?ingredient=butter')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"Butter Cookies"' /tmp/search_body \
  && grep -q '"Toast"' /tmp/search_body \
  && ! grep -q '"Salad"' /tmp/search_body; then
  FIRST_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/search_body | head -1)
  if echo "$FIRST_NAME" | grep -q 'Butter Cookies'; then
    PASS1=true
  fi
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes?ingredient=butter\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an ingredient with no matches returns an empty list.
RESP2=$(curl -s -o /tmp/search_empty_body -w '%{http_code}' 'http://localhost:8080/recipes?ingredient=chocolate')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/search_empty_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] && [ "$COUNT2" = "0" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes?ingredient=chocolate\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing ingredient query param returns 400.
RESP3=$(curl -s -o /tmp/search_missing_body -w '%{http_code}' 'http://localhost:8080/recipes')
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes\",\"status\":$RESP3,\"passed\":$PASS3}"
