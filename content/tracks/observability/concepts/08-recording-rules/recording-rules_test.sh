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

echo "Running recording-rules tests against stub.yaml..."

check "groups key present"                      grep -qE '^groups:' "$STUB"
check "group name web-app-red"                   grep -qE 'name:\s*web-app-red' "$STUB"
check "group interval 30s"                       grep -qE 'interval:\s*30s' "$STUB"
check "rules key present"                        grep -qE '^\s*rules:' "$STUB"
check "rate5m rule for requests recorded"        grep -q 'record: job:http_requests:rate5m' "$STUB"
check "rate5m expr sums by job"                  grep -qE 'expr:\s*sum by \(job\) \(rate\(http_requests_total\[5m\]\)\)' "$STUB"
check "error rate5m rule recorded"               grep -q 'record: job:http_request_errors:rate5m' "$STUB"
check "error rate5m expr filters 5xx"            grep -qE 'status=~"5\.\."' "$STUB"
check "error ratio rule recorded"                grep -q 'record: job:http_request_errors:ratio_rate5m' "$STUB"
check "error ratio references recorded rules"    grep -qE 'expr:\s*job:http_request_errors:rate5m\s*/\s*job:http_requests:rate5m' "$STUB"
check "p99 duration rule recorded"               grep -q 'record: job:http_request_duration_seconds:p99_rate5m' "$STUB"
check "p99 duration uses histogram_quantile"     grep -q 'histogram_quantile(0.99' "$STUB"
check "p99 duration sums by job and le"          grep -qE 'sum by \(job, le\)' "$STUB"
check "at least four record entries"             bash -c "[[ \$(grep -c 'record:' '$STUB') -ge 4 ]]"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
