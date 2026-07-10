#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: default-limit first page returns 5 published posts out of a
# total of 7 (3 drafts excluded).
RESP1=$(curl -s -o /tmp/feed_page1_body -w '%{http_code}' 'http://localhost:8080/posts?page=1&limit=5')
COUNT1=$(grep -o '"published"[[:space:]]*:[[:space:]]*true' /tmp/feed_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*7' /tmp/feed_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/feed_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*5' /tmp/feed_page1_body \
  && [ "$COUNT1" = "5" ] \
  && ! grep -q '"title"[[:space:]]*:[[:space:]]*"Draft A"' /tmp/feed_page1_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts?page=1&limit=5\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining 2 published posts.
RESP2=$(curl -s -o /tmp/feed_page2_body -w '%{http_code}' 'http://localhost:8080/posts?page=2&limit=5')
COUNT2=$(grep -o '"published"[[:space:]]*:[[:space:]]*true' /tmp/feed_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*7' /tmp/feed_page2_body \
  && [ "$COUNT2" = "2" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts?page=2&limit=5\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a limit above the cap is clamped to 20, and all 7 published
# posts fit on one page at that clamp.
RESP3=$(curl -s -o /tmp/feed_clamp_body -w '%{http_code}' 'http://localhost:8080/posts?page=1&limit=999')
COUNT3=$(grep -o '"published"[[:space:]]*:[[:space:]]*true' /tmp/feed_clamp_body | wc -l | tr -d ' ')
PASS3=false
if [ "$RESP3" = "200" ] \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*20' /tmp/feed_clamp_body \
  && [ "$COUNT3" = "7" ]; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts?page=1&limit=999\",\"status\":$RESP3,\"passed\":$PASS3}"
