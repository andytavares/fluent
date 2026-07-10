#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default first page returns 2 channels out of a total of 3,
# in alphabetical order, including the zero-message channel with a null
# last_message_at.
RESP1=$(curl -s -o /tmp/board_page1_body -w '%{http_code}' 'http://localhost:8080/channels?page=1&limit=2')
COUNT1=$(grep -o '"name"[[:space:]]*:' /tmp/board_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*3' /tmp/board_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/board_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*2' /tmp/board_page1_body \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"empty-room"' /tmp/board_page1_body \
  && grep -q '"messages"[[:space:]]*:[[:space:]]*0' /tmp/board_page1_body \
  && grep -q '"last_message_at"[[:space:]]*:[[:space:]]*null' /tmp/board_page1_body \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"general"' /tmp/board_page1_body \
  && grep -q '"messages"[[:space:]]*:[[:space:]]*3' /tmp/board_page1_body \
  && [ "$COUNT1" = "2" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/channels?page=1&limit=2\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining channel (random) with its
# correct message count.
RESP2=$(curl -s -o /tmp/board_page2_body -w '%{http_code}' 'http://localhost:8080/channels?page=2&limit=2')
COUNT2=$(grep -o '"name"[[:space:]]*:' /tmp/board_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*3' /tmp/board_page2_body \
  && grep -q '"name"[[:space:]]*:[[:space:]]*"random"' /tmp/board_page2_body \
  && grep -q '"messages"[[:space:]]*:[[:space:]]*2' /tmp/board_page2_body \
  && [ "$COUNT2" = "1" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/channels?page=2&limit=2\",\"status\":$RESP2,\"passed\":$PASS2}"
