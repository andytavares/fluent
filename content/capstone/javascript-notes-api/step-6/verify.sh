#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: q=meeting, default limit 5, page 1 returns 5 of 7 total matches.
RESP1=$(curl -s -o /tmp/search_page1_body -w '%{http_code}' 'http://localhost:8080/notes?q=meeting&page=1&limit=5')
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/search_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*7' /tmp/search_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/search_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*5' /tmp/search_page1_body \
  && [ "$COUNT1" = "5" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?q=meeting&page=1&limit=5\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: page 2 returns the remaining 2 matches.
RESP2=$(curl -s -o /tmp/search_page2_body -w '%{http_code}' 'http://localhost:8080/notes?q=meeting&page=2&limit=5')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/search_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*7' /tmp/search_page2_body \
  && [ "$COUNT2" = "2" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?q=meeting&page=2&limit=5\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a huge requested limit is clamped to 50, and non-matching
# decoy notes (Grocery list, Random thought) are excluded from the search.
RESP3=$(curl -s -o /tmp/search_clamp_body -w '%{http_code}' 'http://localhost:8080/notes?q=meeting&limit=1000')
PASS3=false
if [ "$RESP3" = "200" ] \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*50' /tmp/search_clamp_body \
  && grep -q '"total"[[:space:]]*:[[:space:]]*7' /tmp/search_clamp_body \
  && ! grep -q '"Grocery list"' /tmp/search_clamp_body \
  && ! grep -q '"Random thought"' /tmp/search_clamp_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?q=meeting&limit=1000\",\"status\":$RESP3,\"passed\":$PASS3}"
