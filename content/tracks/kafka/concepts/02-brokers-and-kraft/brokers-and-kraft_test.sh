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

echo "Running brokers-and-kraft tests against stub.properties..."

check "node.id is 3"                         grep -qE '^node\.id=3\s*$' "$STUB"
check "process.roles is broker,controller"   grep -qE '^process\.roles=broker,controller\s*$' "$STUB"
check "listeners define PLAINTEXT on 9092"   grep -qE '^listeners=.*PLAINTEXT://0\.0\.0\.0:9092' "$STUB"
check "listeners define CONTROLLER on 9093"  grep -qE '^listeners=.*CONTROLLER://0\.0\.0\.0:9093' "$STUB"
check "advertised.listeners uses broker-3.internal:9092" grep -qE '^advertised\.listeners=PLAINTEXT://broker-3\.internal:9092\s*$' "$STUB"
check "advertised.listeners does not expose CONTROLLER" bash -c "! grep -E '^advertised\.listeners=' '$STUB' | grep -q CONTROLLER"
check "controller.listener.names is CONTROLLER" grep -qE '^controller\.listener\.names=CONTROLLER\s*$' "$STUB"
check "inter.broker.listener.name is PLAINTEXT" grep -qE '^inter\.broker\.listener\.name=PLAINTEXT\s*$' "$STUB"
check "controller.quorum.voters lists node 1" grep -qE '^controller\.quorum\.voters=.*1@broker-1\.internal:9093' "$STUB"
check "controller.quorum.voters lists node 2" grep -qE '^controller\.quorum\.voters=.*2@broker-2\.internal:9093' "$STUB"
check "controller.quorum.voters lists node 3" grep -qE '^controller\.quorum\.voters=.*3@broker-3\.internal:9093' "$STUB"
check "log.dirs set to /var/lib/kafka/data"  grep -qE '^log\.dirs=/var/lib/kafka/data\s*$' "$STUB"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
