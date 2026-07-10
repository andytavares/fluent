#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default first page returns 10 entries out of a total of 15,
# oldest first (id 1 first).
RESP1=$(curl -s -o /tmp/list_page1_body -w '%{http_code}' 'http://localhost:8080/entries?page=1&limit=10')
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/list_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*15' /tmp/list_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/list_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*10' /tmp/list_page1_body \
  && grep -q '"entries"[[:space:]]*:[[:space:]]*\[[[:space:]]*{"id"[[:space:]]*:[[:space:]]*1[,}]' /tmp/list_page1_body \
  && [ "$COUNT1" = "10" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/entries?page=1&limit=10\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining 5 entries.
RESP2=$(curl -s -o /tmp/list_page2_body -w '%{http_code}' 'http://localhost:8080/entries?page=2&limit=10')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/list_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*15' /tmp/list_page2_body \
  && [ "$COUNT2" = "5" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/entries?page=2&limit=10\",\"status\":$RESP2,\"passed\":$PASS2}"
