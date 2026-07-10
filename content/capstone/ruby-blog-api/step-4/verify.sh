#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: publishing a draft succeeds with published=true and a non-null
# published_at.
RESP1=$(curl -s -X POST -o /tmp/publish_ok_body -w '%{http_code}' http://localhost:8080/posts/1/publish)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"published"[[:space:]]*:[[:space:]]*true' /tmp/publish_ok_body \
  && ! grep -q '"published_at"[[:space:]]*:[[:space:]]*null' /tmp/publish_ok_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts/1/publish\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: publishing an already-published post returns 409.
RESP2=$(curl -s -X POST -o /tmp/publish_conflict_body -w '%{http_code}' http://localhost:8080/posts/2/publish)
PASS2=false
if [ "$RESP2" = "409" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"already published"' /tmp/publish_conflict_body; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts/2/publish\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: publishing a nonexistent id returns 404.
RESP3=$(curl -s -X POST -o /tmp/publish_missing_body -w '%{http_code}' http://localhost:8080/posts/9999/publish)
PASS3=false
if [ "$RESP3" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/publish_missing_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts/9999/publish\",\"status\":$RESP3,\"passed\":$PASS3}"
