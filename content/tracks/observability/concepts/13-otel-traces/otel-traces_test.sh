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

echo "Running otel-traces tests against stub.yaml..."

check "spans list present"                      grep -qE '^spans:' "$STUB"
check "POST /checkout span defined"             grep -q 'POST /checkout' "$STUB"
check "checkout span kind server"               grep -qE 'kind:\s*server' "$STUB"
check "http.route attribute present"            grep -q 'http.route: /checkout' "$STUB"
check "charge-payment span defined"             grep -q 'name: charge-payment' "$STUB"
check "charge-payment span kind internal"       grep -qE 'kind:\s*internal' "$STUB"
check "payment.provider attribute stripe"       grep -qE 'payment\.provider:\s*stripe' "$STUB"
check "stripe.charge span defined"              grep -q 'name: stripe.charge' "$STUB"
check "stripe.charge span kind client"          grep -qE 'kind:\s*client' "$STUB"
check "peer.service attribute stripe"           grep -qE 'peer\.service:\s*stripe' "$STUB"
check "propagation header traceparent"          grep -qE 'header:\s*traceparent' "$STUB"
check "propagation standard w3c"                grep -qE 'standard:\s*w3c' "$STUB"
check "sampling strategy tail"                  grep -qE 'strategy:\s*tail' "$STUB"
check "sampling rules present"                  grep -qE '^\s*rules:' "$STUB"
check "error condition sampled at 1.0"          grep -qE 'condition:\s*"status == Error"' "$STUB"
check "slow-duration condition sampled at 1.0"  grep -qE 'condition:\s*"duration > 1s"' "$STUB"
check "default_sample_rate 0.1"                 grep -qE 'default_sample_rate:\s*0\.1' "$STUB"
check "exemplars enabled true"                  grep -qE 'enabled:\s*true' "$STUB"
check "exemplars linked to duration metric"     grep -q 'linked_metric: http_request_duration_seconds' "$STUB"
check "no leftover TODO comments"                bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
