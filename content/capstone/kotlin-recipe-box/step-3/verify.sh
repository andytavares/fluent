#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: a rated recipe (stars 4, 5) returns an average of exactly 4.5.
RESP1=$(curl -s -o /tmp/get_rated_body -w '%{http_code}' http://localhost:8080/recipes/1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"Pancakes"' /tmp/get_rated_body \
  && grep -q '"avg_stars"[[:space:]]*:[[:space:]]*4\.5' /tmp/get_rated_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an unrated recipe returns avg_stars null (not 0).
RESP2=$(curl -s -o /tmp/get_unrated_body -w '%{http_code}' http://localhost:8080/recipes/2)
PASS2=false
if [ "$RESP2" = "200" ] && grep -q '"avg_stars"[[:space:]]*:[[:space:]]*null' /tmp/get_unrated_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/2\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: fetching a nonexistent id returns 404.
RESP3=$(curl -s -o /tmp/get_missing_body -w '%{http_code}' http://localhost:8080/recipes/9999)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/get_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/9999\",\"status\":$RESP3,\"passed\":$PASS3}"
