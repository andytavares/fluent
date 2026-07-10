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

echo "Running otel-fundamentals tests against stub.yaml..."

check "resource key present"                    grep -qE '^resource:' "$STUB"
check "attributes block present"                 grep -qE '^\s*attributes:' "$STUB"
check "service.name is checkout-api"             grep -qE 'service\.name:\s*checkout-api' "$STUB"
check "service.version set"                       grep -qE 'service\.version:\s*"2\.4\.1"' "$STUB"
check "deployment.environment is production"     grep -qE 'deployment\.environment:\s*production' "$STUB"
check "k8s.pod.name set"                          grep -q 'k8s.pod.name' "$STUB"
check "instrumentation key present"              grep -qE '^instrumentation:' "$STUB"
check "auto instrumentation list present"        grep -qE 'auto:\s*\[http-server,\s*http-client,\s*db-driver\]' "$STUB"
check "manual instrumentation list present"      grep -qE 'manual:\s*\[pricing-quote-duration,\s*cart-item-count\]' "$STUB"
check "exporters key present"                    grep -qE '^exporters:' "$STUB"
check "otlp exporter block present"              grep -qE '^\s*otlp:' "$STUB"
check "otlp endpoint set"                         grep -q 'otel-collector:4317' "$STUB"
check "otlp protocol grpc"                        grep -qE 'protocol:\s*grpc' "$STUB"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
