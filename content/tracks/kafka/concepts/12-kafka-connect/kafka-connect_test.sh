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

echo "Running kafka-connect tests against stub.properties..."

check "name is postgres-orders-sink"         grep -qE '^name=postgres-orders-sink\s*$' "$STUB"
check "connector.class is JdbcSinkConnector" grep -qE '^connector\.class=io\.confluent\.connect\.jdbc\.JdbcSinkConnector\s*$' "$STUB"
check "tasks.max is 4"                       grep -qE '^tasks\.max=4\s*$' "$STUB"
check "topics is orders"                     grep -qE '^topics=orders\s*$' "$STUB"
check "connection.url set to postgres jdbc"  grep -qE '^connection\.url=jdbc:postgresql://' "$STUB"
check "key.converter is StringConverter"     grep -qE '^key\.converter=org\.apache\.kafka\.connect\.storage\.StringConverter\s*$' "$STUB"
check "value.converter is AvroConverter"     grep -qE '^value\.converter=io\.confluent\.connect\.avro\.AvroConverter\s*$' "$STUB"
check "value converter schema registry url"  grep -qE '^value\.converter\.schema\.registry\.url=http://schema-registry:8081\s*$' "$STUB"
check "errors.tolerance is all"              grep -qE '^errors\.tolerance=all\s*$' "$STUB"
check "dead letter queue topic set"          grep -qE '^errors\.deadletterqueue\.topic\.name=orders-sink-dlq\s*$' "$STUB"
check "dlq context headers enabled"          grep -qE '^errors\.deadletterqueue\.context\.headers\.enable=true\s*$' "$STUB"
check "errors.tolerance not left at none"    bash -c "! grep -qE '^errors\.tolerance=none\s*\$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
