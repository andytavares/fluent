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

echo "Running promql-aggregations tests against stub.yaml..."

check "queries list present"                    grep -qE '^queries:' "$STUB"
check "total_request_rate named"                grep -q 'name: total_request_rate' "$STUB"
check "sum(rate(...)) used"                      grep -qE 'sum\(rate\(http_requests_total\[5m\]\)\)' "$STUB"
check "request_rate_by_route named"             grep -q 'name: request_rate_by_route' "$STUB"
check "sum by (route) used"                      grep -qE 'sum by \(route\)' "$STUB"
check "request_rate_collapse_instance named"    grep -q 'name: request_rate_collapse_instance' "$STUB"
check "sum without (instance) used"             grep -qE 'sum without \(instance\)' "$STUB"
check "top5_error_routes named"                 grep -q 'name: top5_error_routes' "$STUB"
check "topk(5, ...) used"                        grep -qE 'topk\(5,' "$STUB"
check "error_ratio named"                        grep -q 'name: error_ratio' "$STUB"
check "sum without (status) used twice"         bash -c "[[ \$(grep -o 'sum without (status)' '$STUB' | wc -l) -ge 2 ]]"
check "division operator present"                grep -qE '\)\s*/\s*sum' "$STUB"
check "memory_utilization_ratio named"           grep -q 'name: memory_utilization_ratio' "$STUB"
check "on (instance) group_left used"           grep -qE 'on \(instance\) group_left' "$STUB"
check "critical_service_missing named"           grep -q 'name: critical_service_missing' "$STUB"
check "absent() with job selector used"          grep -qE 'absent\(up\{job="critical-service"\}\)' "$STUB"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
