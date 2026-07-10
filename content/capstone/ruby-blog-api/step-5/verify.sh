#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: adding a comment to an existing post returns 201.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"author":"Linus","body":"Interesting approach."}' \
  -o /tmp/comment_create_body -w '%{http_code}' http://localhost:8080/posts/1/comments)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"author"[[:space:]]*:[[:space:]]*"Linus"' /tmp/comment_create_body \
  && grep -q '"post_id"[[:space:]]*:[[:space:]]*1' /tmp/comment_create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts/1/comments\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: adding a comment to a nonexistent post returns 404.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"author":"Nobody","body":"Should not land."}' \
  -o /tmp/comment_missing_body -w '%{http_code}' http://localhost:8080/posts/9999/comments)
PASS2=false
if [ "$RESP2" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/comment_missing_body; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/posts/9999/comments\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: listing comments returns them oldest-first — the seeded "Grace"
# comment must appear before the seeded "Ada" comment in the response body.
RESP3=$(curl -s -o /tmp/comment_list_body -w '%{http_code}' http://localhost:8080/posts/1/comments)
PASS3=false
if [ "$RESP3" = "200" ]; then
  POS_GRACE=$(grep -bo '"author"[[:space:]]*:[[:space:]]*"Grace"' /tmp/comment_list_body | head -1 | cut -d: -f1)
  POS_ADA=$(grep -bo '"author"[[:space:]]*:[[:space:]]*"Ada"' /tmp/comment_list_body | head -1 | cut -d: -f1)
  if [ -n "$POS_GRACE" ] && [ -n "$POS_ADA" ] && [ "$POS_GRACE" -lt "$POS_ADA" ]; then
    PASS3=true
  fi
fi
echo "{\"method\":\"GET\",\"path\":\"/posts/1/comments\",\"status\":$RESP3,\"passed\":$PASS3}"
