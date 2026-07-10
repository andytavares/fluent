#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.yaml"

passed=0
failed=0

check() {
  local name="$1"; shift
  if "$@" &>/dev/null; then
    echo "  PASS: $name"
    passed=$((passed + 1))
  else
    echo "  FAIL: $name"
    failed=$((failed + 1))
  fi
}

echo "Running promql-basics tests against stub.yaml..."

check "queries list present"                    grep -qE '^queries:' "$STUB"
check "current_request_total named"             grep -q 'name: current_request_total' "$STUB"
check "job selector exact match"                 grep -qE 'job="web-app"' "$STUB"
check "five_xx_rate named"                       grep -q 'name: five_xx_rate' "$STUB"
check "regex match selector used"                grep -qE 'status=~"5\.\."' "$STUB"
check "request_rate_5m named"                    grep -q 'name: request_rate_5m' "$STUB"
check "rate() with 5m window"                     grep -qE 'rate\(http_requests_total\[5m\]\)' "$STUB"
check "request_increase_5m named"                grep -q 'name: request_increase_5m' "$STUB"
check "increase() with 5m window"                grep -qE 'increase\(http_requests_total\[5m\]\)' "$STUB"
check "request_rate_spike_check named"           grep -q 'name: request_rate_spike_check' "$STUB"
check "irate() with 1m window"                    grep -qE 'irate\(http_requests_total\[1m\]\)' "$STUB"
check "request_rate_day_over_day named"          grep -q 'name: request_rate_day_over_day' "$STUB"
check "offset 1d used"                            grep -q 'offset 1d' "$STUB"
check "explains field present"                    grep -q 'explains:' "$STUB"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
