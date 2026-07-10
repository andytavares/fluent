#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default top-3 list returns the three highest averages
# (5.0, 4.0, 3.0), highest first, and excludes the unrated recipe.
RESP1=$(curl -s -o /tmp/top3_body -w '%{http_code}' 'http://localhost:8080/recipes/top?limit=3')
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/top3_body | wc -l | tr -d ' ')
FIRST1=$(grep -o '"avg_stars"[[:space:]]*:[[:space:]]*[0-9.]*' /tmp/top3_body | head -1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && [ "$COUNT1" = "3" ] \
  && grep -q '"Butter Cookies"' /tmp/top3_body \
  && grep -q '"Toast"' /tmp/top3_body \
  && grep -q '"Oatmeal"' /tmp/top3_body \
  && ! grep -q '"Unrated Stew"' /tmp/top3_body \
  && ! grep -q '"Plain Rice"' /tmp/top3_body \
  && echo "$FIRST1" | grep -q '5\.0'; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/top?limit=3\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an unrated recipe never appears even with a high limit, and the
# rated count (4) is returned in full since it's under the clamp of 10.
RESP2=$(curl -s -o /tmp/top_all_body -w '%{http_code}' 'http://localhost:8080/recipes/top?limit=100')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/top_all_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] && [ "$COUNT2" = "4" ] && ! grep -q '"Unrated Stew"' /tmp/top_all_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/top?limit=100\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: ratings_count is reported correctly for the top result (2 ratings).
RESP3=$(curl -s -o /tmp/top_count_body -w '%{http_code}' 'http://localhost:8080/recipes/top?limit=1')
PASS3=false
if [ "$RESP3" = "200" ] \
  && grep -q '"Butter Cookies"' /tmp/top_count_body \
  && grep -q '"ratings_count"[[:space:]]*:[[:space:]]*2' /tmp/top_count_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/recipes/top?limit=1\",\"status\":$RESP3,\"passed\":$PASS3}"
