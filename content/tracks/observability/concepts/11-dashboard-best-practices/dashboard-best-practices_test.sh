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

echo "Running dashboard-best-practices tests against stub.yaml..."

check "dashboard title present"                  grep -q 'title: "Service Overview"' "$STUB"
check "templating key present"                   grep -qE '^templating:' "$STUB"
check "job template variable defined"            grep -qE 'name:\s*job' "$STUB"
check "job variable is single-select"            grep -qE 'multi:\s*false' "$STUB"
check "job includeAll is false"                  grep -qE 'includeAll:\s*false' "$STUB"
check "instance template variable defined"       grep -qE 'name:\s*instance' "$STUB"
check "instance variable cascades on \$job"       grep -qE 'label_values\(http_requests_total\{job="\$job"\}' "$STUB"
check "instance variable is multi-select"        grep -qE 'multi:\s*true' "$STUB"
check "instance includeAll is true"              grep -qE 'includeAll:\s*true' "$STUB"
check "panels list present"                      grep -qE '^panels:' "$STUB"
check "Throughput panel present"                 grep -q 'title: "Throughput"' "$STUB"
check "Error Rate panel present"                 grep -q 'title: "Error Rate"' "$STUB"
check "Latency Percentiles panel present"        grep -q 'title: "Latency Percentiles"' "$STUB"
check "Saturation panel present"                 grep -q 'title: "Saturation"' "$STUB"
check "Dependencies panel present"               grep -q 'title: "Dependencies"' "$STUB"
check "every panel query parameterized by \$job" bash -c "[[ \$(grep -c 'job=\"\$job\"' '$STUB') -ge 5 ]]"
check "histogram_quantile used for latency"      grep -q 'histogram_quantile(0.99' "$STUB"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
