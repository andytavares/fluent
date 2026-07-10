#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: an already-expired key returns 404, same as GET /kv/:key.
RESP1=$(curl -s -o /tmp/ttl_expired_body -w '%{http_code}' http://localhost:8080/kv/expired:key/ttl)
PASS1=false
if [ "$RESP1" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/ttl_expired_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/expired:key/ttl\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a key with no expiry returns a null ttl_seconds.
RESP2=$(curl -s -o /tmp/ttl_forever_body -w '%{http_code}' http://localhost:8080/kv/forever:key/ttl)
PASS2=false
if [ "$RESP2" = "200" ] && grep -q '"ttl_seconds"[[:space:]]*:[[:space:]]*null' /tmp/ttl_forever_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/forever:key/ttl\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a far-future key returns a large positive integer ttl_seconds
# (roughly 3650 days out — well over 300 million seconds).
RESP3=$(curl -s -o /tmp/ttl_future_body -w '%{http_code}' http://localhost:8080/kv/future:key/ttl)
TTL3=$(grep -oE '"ttl_seconds"[[:space:]]*:[[:space:]]*[0-9]+' /tmp/ttl_future_body | grep -oE '[0-9]+$')
PASS3=false
if [ "$RESP3" = "200" ] && [ -n "$TTL3" ] && [ "$TTL3" -gt 300000000 ]; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/future:key/ttl\",\"status\":$RESP3,\"passed\":$PASS3}"

# Check 4: a key that never existed returns 404.
RESP4=$(curl -s -o /tmp/ttl_missing_body -w '%{http_code}' http://localhost:8080/kv/missing:key/ttl)
PASS4=false
if [ "$RESP4" = "404" ] && grep -q '"error"[[:space:]]*:[[:space:]]*"not found"' /tmp/ttl_missing_body; then
  PASS4=true
fi
echo "{\"method\":\"GET\",\"path\":\"/kv/missing:key/ttl\",\"status\":$RESP4,\"passed\":$PASS4}"
