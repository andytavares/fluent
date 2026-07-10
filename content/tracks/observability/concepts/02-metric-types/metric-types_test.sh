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

echo "Running metric-types tests against stub.yaml..."

check "metric_definitions key present"          grep -qE '^metric_definitions:' "$STUB"
check "http_requests_total defined"             grep -q 'name: http_requests_total' "$STUB"
check "http_requests_total is a counter"        grep -qE 'type:\s*counter' "$STUB"
check "http_requests_total labels present"      grep -qE 'labels:\s*\[method,\s*status,\s*route\]' "$STUB"
check "http_requests_in_flight defined"         grep -q 'name: http_requests_in_flight' "$STUB"
check "http_request_duration_seconds defined"   grep -q 'name: http_request_duration_seconds' "$STUB"
check "duration metric is a histogram"          grep -qE 'type:\s*histogram' "$STUB"
check "duration metric labels present"          grep -qE 'labels:\s*\[method,\s*route\]' "$STUB"
check "process_resident_memory_bytes defined"   grep -q 'name: process_resident_memory_bytes' "$STUB"
check "at least two gauges defined"             bash -c "[[ \$(grep -cE 'type:\s*gauge' '$STUB') -ge 2 ]]"
check "help text present"                       grep -q 'help:' "$STUB"
check "scrape_configs key present"               grep -qE '^scrape_configs:' "$STUB"
check "web-app job defined"                     grep -qE "job_name:\s*'web-app'" "$STUB"
check "web-app target present"                  grep -q "web-app:8080" "$STUB"
check "cardinality_review comment present"      grep -q 'cardinality_review' "$STUB"
check "user_id called out as dangerous label"   grep -q 'user_id' "$STUB"
check "no leftover TODO comments"               bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
