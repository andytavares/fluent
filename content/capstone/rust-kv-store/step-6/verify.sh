#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default first page returns 10 keys out of a total of 12
# (the expired user:99 key and other prefixes are excluded).
RESP1=$(curl -s -o /tmp/list_page1_body -w '%{http_code}' 'http://localhost:8080/kv?prefix=user:&page=1&limit=10')
COUNT1=$(grep -o '"key"[[:space:]]*:' /tmp/list_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*12' /tmp/list_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/list_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*10' /tmp/list_page1_body \
  && grep -q '"key"[[:space:]]*:[[:space:]]*"user:01"' /tmp/list_page1_body \
  && [ "$COUNT1" = "10" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv?prefix=user:&page=1&limit=10\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining 2 keys.
RESP2=$(curl -s -o /tmp/list_page2_body -w '%{http_code}' 'http://localhost:8080/kv?prefix=user:&page=2&limit=10')
COUNT2=$(grep -o '"key"[[:space:]]*:' /tmp/list_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*12' /tmp/list_page2_body \
  && grep -q '"key"[[:space:]]*:[[:space:]]*"user:12"' /tmp/list_page2_body \
  && [ "$COUNT2" = "2" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv?prefix=user:&page=2&limit=10\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a prefix matching nothing returns an empty list with total 0.
RESP3=$(curl -s -o /tmp/list_empty_body -w '%{http_code}' 'http://localhost:8080/kv?prefix=nomatch:&page=1&limit=10')
PASS3=false
if [ "$RESP3" = "200" ] \
  && grep -q '"entries"[[:space:]]*:[[:space:]]*\[\]' /tmp/list_empty_body \
  && grep -q '"total"[[:space:]]*:[[:space:]]*0' /tmp/list_empty_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv?prefix=nomatch:&page=1&limit=10\",\"status\":$RESP3,\"passed\":$PASS3}"
