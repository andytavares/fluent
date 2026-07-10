#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: fetching an existing draft post (seeded by fixtures.sql) returns
# 200 with published=false and published_at=null.
RESP1=$(curl -s -o /tmp/get_found_body -w '%{http_code}' http://localhost:8080/posts/1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Hello, World"' /tmp/get_found_body \
  && grep -q '"published"[[:space:]]*:[[:space:]]*false' /tmp/get_found_body \
  && grep -q '"published_at"[[:space:]]*:[[:space:]]*null' /tmp/get_found_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts/1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: fetching a nonexistent id returns 404 with an error body.
RESP2=$(curl -s -o /tmp/get_missing_body -w '%{http_code}' http://localhost:8080/posts/9999)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/get_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts/9999\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a non-numeric id returns 400.
RESP3=$(curl -s -o /tmp/get_badid_body -w '%{http_code}' http://localhost:8080/posts/abc)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/posts/abc\",\"status\":$RESP3,\"passed\":$PASS3}"
