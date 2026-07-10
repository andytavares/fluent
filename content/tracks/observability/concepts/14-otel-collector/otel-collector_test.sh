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

echo "Running otel-collector tests against stub.yaml..."

check "receivers key present"                    grep -qE '^receivers:' "$STUB"
check "otlp receiver defined"                    grep -qE '^\s*otlp:' "$STUB"
check "grpc protocol enabled"                    grep -qE '^\s*grpc:' "$STUB"
check "http protocol enabled"                    grep -qE '^\s*http:' "$STUB"
check "processors key present"                   grep -qE '^processors:' "$STUB"
check "memory_limiter processor defined"         grep -qE '^\s*memory_limiter:' "$STUB"
check "memory_limiter check_interval 1s"         grep -qE 'check_interval:\s*1s' "$STUB"
check "memory_limiter limit_mib 512"             grep -qE 'limit_mib:\s*512' "$STUB"
check "resource processor defined"               grep -qE '^\s*resource:' "$STUB"
check "resource upserts deployment.environment"  grep -qE 'key:\s*deployment\.environment' "$STUB"
check "resource action upsert"                   grep -qE 'action:\s*upsert' "$STUB"
check "batch processor defined"                  grep -qE '^\s*batch:' "$STUB"
check "batch timeout 5s"                          grep -qE 'timeout:\s*5s' "$STUB"
check "batch send_batch_size 1024"               grep -qE 'send_batch_size:\s*1024' "$STUB"
check "memory_limiter appears before batch"      bash -c "grep -n 'memory_limiter:' '$STUB' | head -1 | cut -d: -f1 > /tmp/ml_line_$$; grep -n '^\s*batch:' '$STUB' | head -1 | cut -d: -f1 > /tmp/b_line_$$; [[ \$(cat /tmp/ml_line_$$) -lt \$(cat /tmp/b_line_$$) ]]"
check "prometheusremotewrite exporter defined"   grep -qE '^\s*prometheusremotewrite:' "$STUB"
check "prometheus remote write endpoint set"     grep -q 'http://prometheus:9090/api/v1/write' "$STUB"
check "otlp/tempo exporter defined"              grep -qE '^\s*otlp/tempo:' "$STUB"
check "tempo endpoint set"                        grep -q 'tempo:4317' "$STUB"
check "service.pipelines present"                grep -qE '^\s*pipelines:' "$STUB"
check "metrics pipeline defined"                 grep -qE '^\s*metrics:' "$STUB"
check "traces pipeline defined"                  grep -qE '^\s*traces:' "$STUB"
check "pipeline processors in correct order"     bash -c "[[ \$(grep -c 'processors: \[memory_limiter, resource, batch\]' '$STUB') -ge 2 ]]"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
