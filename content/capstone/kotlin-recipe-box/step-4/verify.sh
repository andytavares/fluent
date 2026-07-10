#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: rating a recipe (existing 3-star rating + new 5-star rating)
# returns 201 with the updated average of exactly 4.0.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"stars":5}' \
  -o /tmp/rate_ok_body -w '%{http_code}' http://localhost:8080/recipes/1/ratings)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"recipe_id"[[:space:]]*:[[:space:]]*1' /tmp/rate_ok_body \
  && grep -q '"stars"[[:space:]]*:[[:space:]]*5' /tmp/rate_ok_body \
  && grep -q '"avg_stars"[[:space:]]*:[[:space:]]*4\.0' /tmp/rate_ok_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes/1/ratings\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an out-of-range rating (6) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"stars":6}' \
  -o /tmp/rate_bad_body -w '%{http_code}' http://localhost:8080/recipes/1/ratings)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes/1/ratings\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: rating an unknown recipe returns 404.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"stars":5}' \
  -o /tmp/rate_missing_body -w '%{http_code}' http://localhost:8080/recipes/9999/ratings)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/rate_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/recipes/9999/ratings\",\"status\":$RESP3,\"passed\":$PASS3}"
