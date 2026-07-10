#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.properties"

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

throughput_section() {
  awk '/=== throughput-tuned producer ===/{p=1; next} /=== correctness-safe producer ===/{p=0} p' "$STUB"
}

correctness_section() {
  awk '/=== correctness-safe producer ===/{p=1; next} p' "$STUB"
}

export STUB
export -f throughput_section correctness_section

echo "Running producers tests against stub.properties..."

check "both section markers present" bash -c "
  grep -q '=== throughput-tuned producer ===' '$STUB' &&
  grep -q '=== correctness-safe producer ===' '$STUB'
"

check "throughput: acks=1"            bash -c "throughput_section | grep -qE '^acks=1\s*\$'"
check "throughput: batch.size=65536"  bash -c "throughput_section | grep -qE '^batch\.size=65536\s*\$'"
check "throughput: linger.ms=20"      bash -c "throughput_section | grep -qE '^linger\.ms=20\s*\$'"
check "throughput: compression.type=lz4" bash -c "throughput_section | grep -qE '^compression\.type=lz4\s*\$'"
check "throughput: buffer.memory=67108864" bash -c "throughput_section | grep -qE '^buffer\.memory=67108864\s*\$'"

check "correctness: acks=all"         bash -c "correctness_section | grep -qE '^acks=all\s*\$'"
check "correctness: enable.idempotence=true" bash -c "correctness_section | grep -qE '^enable\.idempotence=true\s*\$'"
check "correctness: retries=2147483647" bash -c "correctness_section | grep -qE '^retries=2147483647\s*\$'"
check "correctness: max.in.flight.requests.per.connection=5" bash -c "correctness_section | grep -qE '^max\.in\.flight\.requests\.per\.connection=5\s*\$'"
check "correctness: delivery.timeout.ms=120000" bash -c "correctness_section | grep -qE '^delivery\.timeout\.ms=120000\s*\$'"

check "no leftover TODO comments"     bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
