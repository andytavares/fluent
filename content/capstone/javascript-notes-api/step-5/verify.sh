#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: tag=work returns exactly Note C and Note A, newest first.
RESP1=$(curl -s -o /tmp/tag_work_body -w '%{http_code}' 'http://localhost:8080/notes?tag=work')
COUNT1=$(grep -o '"id"[[:space:]]*:' /tmp/tag_work_body | wc -l | tr -d ' ')
POS_C=$(grep -bo '"Note C"' /tmp/tag_work_body | head -1 | cut -d: -f1)
POS_A=$(grep -bo '"Note A"' /tmp/tag_work_body | head -1 | cut -d: -f1)
PASS1=false
if [ "$RESP1" = "200" ] \
  && [ "$COUNT1" = "2" ] \
  && ! grep -q '"Note B"' /tmp/tag_work_body \
  && [ -n "$POS_C" ] && [ -n "$POS_A" ] \
  && [ "$POS_C" -lt "$POS_A" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?tag=work\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: tag=home returns only Note B.
RESP2=$(curl -s -o /tmp/tag_home_body -w '%{http_code}' 'http://localhost:8080/notes?tag=home')
COUNT2=$(grep -o '"id"[[:space:]]*:' /tmp/tag_home_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && [ "$COUNT2" = "1" ] \
  && grep -q '"Note B"' /tmp/tag_home_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?tag=home\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: a tag with no matches returns an empty array, not an error.
RESP3=$(curl -s -o /tmp/tag_none_body -w '%{http_code}' 'http://localhost:8080/notes?tag=nonexistent')
PASS3=false
if [ "$RESP3" = "200" ] && grep -q '"notes"[[:space:]]*:[[:space:]]*\[\]' /tmp/tag_none_body; then
  PASS3=true
fi
echo "{\"method\":\"GET\",\"path\":\"/notes?tag=nonexistent\",\"status\":$RESP3,\"passed\":$PASS3}"
