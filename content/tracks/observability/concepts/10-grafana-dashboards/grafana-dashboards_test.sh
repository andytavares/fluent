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

echo "Running grafana-dashboards tests against stub.yaml..."

check "dashboard title present"                 grep -q 'title: "Web App RED Overview"' "$STUB"
check "panels list present"                      grep -qE '^panels:' "$STUB"
check "three panel ids defined"                  bash -c "[[ \$(grep -cE '^\s*-?\s*id:\s*[123]\s*$' '$STUB') -ge 3 ]]"
check "Request Rate panel titled"                grep -q 'title: "Request Rate"' "$STUB"
check "Request Rate panel type timeseries"       grep -q 'type: timeseries' "$STUB"
check "Request Rate gridPos correct"             grep -qE 'gridPos:\s*\{\s*h:\s*8,\s*w:\s*12,\s*x:\s*0,\s*y:\s*0\s*\}' "$STUB"
check "request rate query present"               grep -qE "expr:\s*'sum\(rate\(http_requests_total\[5m\]\)\)'" "$STUB"
check "reqps unit used"                           grep -q 'unit: reqps' "$STUB"
check "Error Ratio panel titled"                 grep -q 'title: "Error Ratio"' "$STUB"
check "Error Ratio panel type stat"               grep -q 'type: stat' "$STUB"
check "Error Ratio gridPos correct"              grep -qE 'gridPos:\s*\{\s*h:\s*8,\s*w:\s*12,\s*x:\s*12,\s*y:\s*0\s*\}' "$STUB"
check "percentunit used for error ratio"          grep -q 'unit: percentunit' "$STUB"
check "thresholds block present"                  grep -qE '^\s*thresholds:' "$STUB"
check "green/yellow/red threshold steps present" bash -c "grep -q 'green' '$STUB' && grep -q 'yellow' '$STUB' && grep -q 'red' '$STUB'"
check "Latency Percentiles panel titled"         grep -q 'title: "Latency Percentiles"' "$STUB"
check "Latency gridPos spans full width"          grep -qE 'gridPos:\s*\{\s*h:\s*8,\s*w:\s*24,\s*x:\s*0,\s*y:\s*8\s*\}' "$STUB"
check "p95 legendFormat present"                  grep -q 'legendFormat: "p95"' "$STUB"
check "p99 legendFormat present"                  grep -q 'legendFormat: "p99"' "$STUB"
check "histogram_quantile 0.95 used"              grep -q 'histogram_quantile(0.95' "$STUB"
check "histogram_quantile 0.99 used"              grep -q 'histogram_quantile(0.99' "$STUB"
check "seconds unit used for latency"             grep -q 'unit: s' "$STUB"
check "no leftover TODO comments"                 bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
