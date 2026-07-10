#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: recording a reading with valid fields returns 201 with the row.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"sensor":"temp-1","value_milli":21500}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/readings)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"sensor"[[:space:]]*:[[:space:]]*"temp-1"' /tmp/create_body \
  && grep -q '"value_milli"[[:space:]]*:[[:space:]]*21500' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"taken_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/readings\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (sensor) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"value_milli":21500}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/readings)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/readings\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a non-integer value_milli returns 400.
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"sensor":"temp-1","value_milli":"warm"}' \
  -o /tmp/create_badvalue_body -w '%{http_code}' http://localhost:8080/readings)
PASS3=false
if [ "$RESP3" = "400" ]; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/readings\",\"status\":$RESP3,\"passed\":$PASS3}"
