#!/bin/bash
# HTTP verification script — outputs one JSON line per check.
set -uo pipefail

RESP=$(curl -s -o /tmp/board_body -w '%{http_code}' http://localhost:8080/board)

# Check 1: the response has the right shape and correct counts (3 todo,
# 2 in_progress, 1 done, seeded by fixtures.sql).
PASS1=false
if [ "$RESP" = "200" ] \
  && grep -q '"todo"[[:space:]]*:[[:space:]]*3' /tmp/board_body \
  && grep -q '"in_progress"[[:space:]]*:[[:space:]]*2' /tmp/board_body \
  && grep -q '"done"[[:space:]]*:[[:space:]]*1' /tmp/board_body \
  && grep -q '"counts"' /tmp/board_body; then
  PASS1=true
fi
echo "{\"method\":\"GET\",\"path\":\"/board\",\"status\":$RESP,\"passed\":$PASS1}"

# Check 2: the todo column actually lists the seeded todo tasks by title.
PASS2=false
if grep -q '"title"[[:space:]]*:[[:space:]]*"Write launch checklist"' /tmp/board_body \
  && grep -q '"title"[[:space:]]*:[[:space:]]*"Rotate API keys"' /tmp/board_body; then
  PASS2=true
fi
echo "{\"method\":\"GET\",\"path\":\"/board\",\"status\":$RESP,\"passed\":$PASS2}"
