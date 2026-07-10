#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: posting a message into a seeded channel returns 201 with the row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"author":"ada","body":"hello, general"}' \
  -o /tmp/post_body -w '%{http_code}' http://localhost:8080/channels/general/messages)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"channel"[[:space:]]*:[[:space:]]*"general"' /tmp/post_body \
  && grep -q '"author"[[:space:]]*:[[:space:]]*"ada"' /tmp/post_body \
  && grep -q '"body"[[:space:]]*:[[:space:]]*"hello, general"' /tmp/post_body \
  && grep -q '"id"[[:space:]]*:' /tmp/post_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels/general/messages\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: posting into a nonexistent channel returns 404 with an error body.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"author":"ada","body":"hello"}' \
  -o /tmp/post_missing_body -w '%{http_code}' http://localhost:8080/channels/ghost/messages)
PASS2=false
if [ "$RESP2" = "404" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels/ghost/messages\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing required field (body) returns 400.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"author":"ada"}' \
  -o /tmp/post_bad_body -w '%{http_code}' http://localhost:8080/channels/general/messages)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/channels/general/messages\",\"status\":$RESP3,\"passed\":$PASS3}"
