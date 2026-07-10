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

echo "Running histograms-and-quantiles tests against stub.yaml..."

check "histogram_definition key present"       grep -qE '^histogram_definition:' "$STUB"
check "histogram name is duration seconds"     grep -q 'name: http_request_duration_seconds' "$STUB"
check "buckets list present"                    grep -qE '^\s*buckets:' "$STUB"
check "bucket boundary 0.3 present (SLO)"       grep -qE 'buckets:.*0\.3' "$STUB"
check "bucket boundary 0.1 present"             grep -qE 'buckets:.*0\.1' "$STUB"
check "bucket boundary 1 present"               grep -qE 'buckets:.*\b1\b' "$STUB"
check "queries list present"                    grep -qE '^queries:' "$STUB"
check "p50_latency query named"                 grep -q 'name: p50_latency' "$STUB"
check "p95_latency query named"                 grep -q 'name: p95_latency' "$STUB"
check "p99_latency_per_route query named"       grep -q 'name: p99_latency_per_route' "$STUB"
check "histogram_quantile 0.5 used"             grep -q 'histogram_quantile(0.5' "$STUB"
check "histogram_quantile 0.95 used"            grep -q 'histogram_quantile(0.95' "$STUB"
check "histogram_quantile 0.99 used"            grep -q 'histogram_quantile(0.99' "$STUB"
check "rate() over _bucket with 5m window"      grep -qE 'rate\(http_request_duration_seconds_bucket\[5m\]\)' "$STUB"
check "sum by (le) used"                        grep -qE 'sum by \(le\)' "$STUB"
check "sum by (le, route) used for per-route"   grep -qE 'sum by \(le,\s*route\)' "$STUB"
check "no leftover TODO comments"               bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
