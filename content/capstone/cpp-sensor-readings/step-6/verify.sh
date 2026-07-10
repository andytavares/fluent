#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

# Check 1: the default first page returns 2 sensors out of a total of 3,
# in alphabetical order, with correct per-sensor reading counts.
RESP1=$(curl -s -o /tmp/dir_page1_body -w '%{http_code}' 'http://localhost:8080/sensors?page=1&limit=2')
COUNT1=$(grep -o '"sensor"[[:space:]]*:' /tmp/dir_page1_body | wc -l | tr -d ' ')
PASS1=false
if [ "$RESP1" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*3' /tmp/dir_page1_body \
  && grep -q '"page"[[:space:]]*:[[:space:]]*1' /tmp/dir_page1_body \
  && grep -q '"limit"[[:space:]]*:[[:space:]]*2' /tmp/dir_page1_body \
  && grep -q '"sensor"[[:space:]]*:[[:space:]]*"temp-1"' /tmp/dir_page1_body \
  && grep -q '"readings"[[:space:]]*:[[:space:]]*5' /tmp/dir_page1_body \
  && grep -q '"sensor"[[:space:]]*:[[:space:]]*"temp-2"' /tmp/dir_page1_body \
  && [ "$COUNT1" = "2" ]; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors?page=1&limit=2\",\"status\":$RESP1,\"passed\":$PASS1}"

# Check 2: the second page returns the remaining sensor (temp-3).
RESP2=$(curl -s -o /tmp/dir_page2_body -w '%{http_code}' 'http://localhost:8080/sensors?page=2&limit=2')
COUNT2=$(grep -o '"sensor"[[:space:]]*:' /tmp/dir_page2_body | wc -l | tr -d ' ')
PASS2=false
if [ "$RESP2" = "200" ] \
  && grep -q '"total"[[:space:]]*:[[:space:]]*3' /tmp/dir_page2_body \
  && grep -q '"sensor"[[:space:]]*:[[:space:]]*"temp-3"' /tmp/dir_page2_body \
  && grep -q '"readings"[[:space:]]*:[[:space:]]*2' /tmp/dir_page2_body \
  && [ "$COUNT2" = "1" ]; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/sensors?page=2&limit=2\",\"status\":$RESP2,\"passed\":$PASS2}"
