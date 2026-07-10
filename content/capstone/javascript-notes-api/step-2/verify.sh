#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: creating a note with a title, body, and tags returns 201 with
# the inserted row, tags serialized as a JSON array.
RESP1=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Grocery list","body":"Milk, eggs, bread","tags":["home","shopping"]}' \
  -o /tmp/create_body -w '%{http_code}' http://localhost:8080/notes)
PASS1=false
if [ "$RESP1" = "201" ] \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Grocery list"' /tmp/create_body \
  && grep -q '"home"' /tmp/create_body \
  && grep -q '"shopping"' /tmp/create_body \
  && grep -q '"id"[[:space:]]*:' /tmp/create_body \
  && grep -q '"created_at"[[:space:]]*:' /tmp/create_body; then
  PASS1=true
fi
echo "{\"method\":\"POST\",\"path\":\"/notes\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: a missing required field (title) returns 400.
RESP2=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"body":"No title here"}' \
  -o /tmp/create_missing_body -w '%{http_code}' http://localhost:8080/notes)
PASS2=false
if [ "$RESP2" = "400" ]; then
  PASS2=true
fi
echo "{\"method\":\"POST\",\"path\":\"/notes\",\"status\":$RESP2,\"passed\":$PASS2}"

# Check 3: omitting body/tags still succeeds, defaulting to "" and [].
RESP3=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Just a title"}' \
  -o /tmp/create_minimal_body -w '%{http_code}' http://localhost:8080/notes)
PASS3=false
if [ "$RESP3" = "201" ] && grep -q '"title"[[:space:]]*:[[:space:]]*"Just a title"' /tmp/create_minimal_body; then
  PASS3=true
fi
echo "{\"method\":\"POST\",\"path\":\"/notes\",\"status\":$RESP3,\"passed\":$PASS3}"
