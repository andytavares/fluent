#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the recent-messages feed returns exactly 10 of the 12 seeded
# messages, newest first (message twelve present, message one absent).
RESP1=$(curl -s -o /tmp/recent_body -w '%{http_code}' http://localhost:8080/channels/general/messages)
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/recent_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"channel"[[:space:]]*:[[:space:]]*"general"' /tmp/recent_body \
  && grep -q '"body"[[:space:]]*:[[:space:]]*"message twelve"' /tmp/recent_body \
  && ! grep -q '"body"[[:space:]]*:[[:space:]]*"message one"' /tmp/recent_body \
  && [ "$COUNT1" = "10" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/channels/general/messages\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: an unknown channel returns 404 with an error body.
RESP2=$(curl -s -o /tmp/recent_missing_body -w '%{http_code}' http://localhost:8080/channels/ghost/messages)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/recent_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/channels/ghost/messages\",\"status\":$RESP2,\"passed\":$PASS2}"
