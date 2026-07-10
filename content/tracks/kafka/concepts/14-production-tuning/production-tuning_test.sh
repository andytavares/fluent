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

topic_section() {
  awk '/=== topic config ===/{p=1; next} /=== broker config ===/{p=0} p' "$STUB"
}
broker_section() {
  awk '/=== broker config ===/{p=1; next} /=== producer config ===/{p=0} p' "$STUB"
}
producer_section() {
  awk '/=== producer config ===/{p=1; next} /=== consumer config ===/{p=0} p' "$STUB"
}
consumer_section() {
  awk '/=== consumer config ===/{p=1; next} /=== monitoring ===/{p=0} p' "$STUB"
}
monitoring_section() {
  awk '/=== monitoring ===/{p=1; next} p' "$STUB"
}
export STUB
export -f topic_section broker_section producer_section consumer_section monitoring_section

echo "Running production-tuning tests against stub.properties..."

check "all five section markers present" bash -c "
  grep -q '=== topic config ===' '$STUB' &&
  grep -q '=== broker config ===' '$STUB' &&
  grep -q '=== producer config ===' '$STUB' &&
  grep -q '=== consumer config ===' '$STUB' &&
  grep -q '=== monitoring ===' '$STUB'
"

check "topic: min.insync.replicas=2"         bash -c "topic_section | grep -qE '^min\.insync\.replicas=2\s*\$'"
check "topic: cleanup.policy=delete"         bash -c "topic_section | grep -qE '^cleanup\.policy=delete\s*\$'"
check "topic: retention.ms is 7 days"        bash -c "topic_section | grep -qE '^retention\.ms=604800000\s*\$'"

check "broker: default.replication.factor=3" bash -c "broker_section | grep -qE '^default\.replication\.factor=3\s*\$'"
check "broker: unclean leader election disabled" bash -c "broker_section | grep -qE '^unclean\.leader\.election\.enable=false\s*\$'"

check "producer: acks=all"                   bash -c "producer_section | grep -qE '^acks=all\s*\$'"
check "producer: idempotence enabled"        bash -c "producer_section | grep -qE '^enable\.idempotence=true\s*\$'"
check "producer: compression.type=lz4"       bash -c "producer_section | grep -qE '^compression\.type=lz4\s*\$'"
check "producer: linger.ms=10"               bash -c "producer_section | grep -qE '^linger\.ms=10\s*\$'"

check "consumer: session.timeout.ms=45000"   bash -c "consumer_section | grep -qE '^session\.timeout\.ms=45000\s*\$'"
check "consumer: max.poll.interval.ms=300000" bash -c "consumer_section | grep -qE '^max\.poll\.interval\.ms=300000\s*\$'"
check "consumer: manual commit"              bash -c "consumer_section | grep -qE '^enable\.auto\.commit=false\s*\$'"
check "consumer: CooperativeStickyAssignor"  bash -c "consumer_section | grep -qE '^partition\.assignment\.strategy=.*CooperativeStickyAssignor\s*\$'"

check "monitoring: consumer-lag"             bash -c "monitoring_section | grep -qE '^#\s*monitor=consumer-lag\s*\$'"
check "monitoring: under-replicated-partitions" bash -c "monitoring_section | grep -qE '^#\s*monitor=under-replicated-partitions\s*\$'"
check "monitoring: request-latency-p99"      bash -c "monitoring_section | grep -qE '^#\s*monitor=request-latency-p99\s*\$'"
check "monitoring: isr-shrink-rate"           bash -c "monitoring_section | grep -qE '^#\s*monitor=isr-shrink-rate\s*\$'"

check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
