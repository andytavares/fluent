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

echo "Running red-and-use tests against stub.yaml..."

check "red_queries key present"                 grep -qE '^red_queries:' "$STUB"
check "rate named under RED"                     grep -q 'name: rate' "$STUB"
check "sum(rate(http_requests_total[5m])) used"  grep -qE 'sum\(rate\(http_requests_total\[5m\]\)\)' "$STUB"
check "errors named under RED"                    grep -q 'name: errors' "$STUB"
check "error ratio uses 5xx over total"           grep -qE 'status=~"5\.\."\}\[5m\]\)\)\s*/\s*sum\(rate\(http_requests_total\[5m\]\)\)' "$STUB"
check "duration_p99 named under RED"             grep -q 'name: duration_p99' "$STUB"
check "histogram_quantile 0.99 for duration"     grep -q 'histogram_quantile(0.99' "$STUB"
check "use_queries key present"                   grep -qE '^use_queries:' "$STUB"
check "cpu_utilization named under USE"          grep -q 'name: cpu_utilization' "$STUB"
check "cpu idle mode used for utilization"       grep -qE 'node_cpu_seconds_total\{mode="idle"\}' "$STUB"
check "load_saturation named under USE"          grep -q 'name: load_saturation' "$STUB"
check "node_load1 used"                          grep -q 'node_load1' "$STUB"
check "oom_kill_errors named under USE"          grep -q 'name: oom_kill_errors' "$STUB"
check "oom kill metric used"                     grep -q 'node_vmstat_oom_kill' "$STUB"
check "per_endpoint_error_ratio key present"     grep -qE '^per_endpoint_error_ratio:' "$STUB"
check "per-route error ratio uses sum by (route)" bash -c "[[ \$(grep -o 'sum by (route)' '$STUB' | wc -l) -ge 2 ]]"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
