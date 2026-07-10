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

echo "Running instrumenting-services tests against stub.yaml..."

check "exposition_sample block present"        grep -qE '^exposition_sample:' "$STUB"
check "HELP line for http_requests_total"      grep -q '# HELP http_requests_total' "$STUB"
check "TYPE counter for http_requests_total"   grep -q '# TYPE http_requests_total counter' "$STUB"
check "status=200 sample line"                 grep -q 'status="200"' "$STUB"
check "status=500 sample line"                 grep -q 'status="500"' "$STUB"
check "route label present"                    grep -q 'route="/users/:id"' "$STUB"
check "TYPE histogram for duration metric"     grep -q '# TYPE http_request_duration_seconds histogram' "$STUB"
check "_bucket line with le label"             grep -qE '_bucket\{.*le="[^"]+"\}' "$STUB"
check "_sum line present"                      grep -q 'http_request_duration_seconds_sum' "$STUB"
check "_count line present"                    grep -q 'http_request_duration_seconds_count' "$STUB"
check "scrape_configs present"                  grep -qE '^scrape_configs:' "$STUB"
check "node job defined"                       grep -qE "job_name:\s*'node'" "$STUB"
check "node-exporter target"                   grep -q "node-exporter:9100" "$STUB"
check "blackbox job defined"                   grep -qE "job_name:\s*'blackbox'" "$STUB"
check "metrics_path /probe"                    grep -q '/probe' "$STUB"
check "http_2xx module param"                  grep -q 'http_2xx' "$STUB"
check "relabel_configs present"                 grep -qE '^\s*relabel_configs:' "$STUB"
check "relabel target_label __param_target"    grep -q '__param_target' "$STUB"
check "relabel target_label instance"          grep -qE 'target_label:\s*instance' "$STUB"
check "no leftover TODO comments"              bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
