#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a post with valid fields returns 201 as an unpublished draft.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Hello, World","body":"This is my first post."}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/posts)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Hello, World"' /tmp/create_body \
  && grep -q '"published"[[:space:]]*:[[:space:]]*false' /tmp/create_body \
  && grep -q '"published_at"[[:space:]]*:[[:space:]]*null' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (body) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"No Body Here"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/posts)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts\",\"status\":$RESP2,\"passed\":$PASS2}"
