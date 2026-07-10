#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: setting a key with a TTL returns 200 with a non-null expires_at.
RESP1=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"value":"hello","ttl_seconds":60}' \
  -o /tmp/put_ttl_body -w '%{http_code}' http://localhost:8080/kv/user:1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"key"[[:space:]]*:[[:space:]]*"user:1"' /tmp/put_ttl_body \
  && grep -q '"value"[[:space:]]*:[[:space:]]*"hello"' /tmp/put_ttl_body \
  && grep -q '"expires_at"[[:space:]]*:[[:space:]]*"' /tmp/put_ttl_body; then
  PASS1=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/kv/user:1\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: setting a key without a TTL returns 200 with a null expires_at.
RESP2=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"value":"world"}' \
  -o /tmp/put_nottl_body -w '%{http_code}' http://localhost:8080/kv/perm:1)
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"value"[[:space:]]*:[[:space:]]*"world"' /tmp/put_nottl_body \
  && grep -q '"expires_at"[[:space:]]*:[[:space:]]*null' /tmp/put_nottl_body; then
  PASS2=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/kv/perm:1\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a missing required field (value) returns 400.
RESP3=$(curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{}' \
  -o /tmp/put_missing_body -w '%{http_code}' http://localhost:8080/kv/bad:1)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"PUT\",\"path\":\"/kv/bad:1\",\"status\":$RESP3,\"passed\":$PASS3}"
