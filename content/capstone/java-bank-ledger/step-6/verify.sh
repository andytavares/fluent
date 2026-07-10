#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default first page returns 10 entries out of a total of 15,
# newest first (amount_cents 1500 is the most recently created entry).
RESP1=$(curl -s -o /tmp/entries_page1_body -w '%{http_code}' 'http://localhost:8080/accounts/1/entries?page=1&limit=10')
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/entries_page1_body | wc -l | tr -d ' ')
FIRST1=$(grep -o '"amount_cents"[[:space:]]*:[[:space:]]*[0-9]*' /tmp/entries_page1_body | head -1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*15' /tmp/entries_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/entries_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*10' /tmp/entries_page1_body \
  && [ "$COUNT1" = "10" ] \
  && echo "$FIRST1" | grep -q '1500'; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/accounts/1/entries?page=1&limit=10\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining 5 entries.
RESP2=$(curl -s -o /tmp/entries_page2_body -w '%{http_code}' 'http://localhost:8080/accounts/1/entries?page=2&limit=10')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/entries_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*15' /tmp/entries_page2_body \
  && [ "$COUNT2" = "5" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/accounts/1/entries?page=2&limit=10\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a limit above 100 is clamped to 100.
RESP3=$(curl -s -o /tmp/entries_clamp_body -w '%{http_code}' 'http://localhost:8080/accounts/1/entries?page=1&limit=500')
PASS3=false
if [ "$RESP3" = "200" ] && grep -q '"limit"[[:space:]]*:[[:space:]]*100' /tmp/entries_clamp_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/accounts/1/entries?page=1&limit=500\",\"status\":$RESP3,\"passed\":$PASS3}"

# Check 4: an unknown account returns 404.
RESP4=$(curl -s -o /tmp/entries_missing_body -w '%{http_code}' 'http://localhost:8080/accounts/9999/entries')
PASS4=false
if [ "$RESP4" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/entries_missing_body; then
  PASS4=true
fi
echo "{\"method\":\"GET\",\"path\":\"/accounts/9999/entries\",\"status\":$RESP4,\"passed\":$PASS4}"
