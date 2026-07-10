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

echo "Running schema-management tests against stub.properties..."

check "key.serializer is StringSerializer"   grep -qE '^key\.serializer=org\.apache\.kafka\.common\.serialization\.StringSerializer\s*$' "$STUB"
check "value.serializer is KafkaAvroSerializer" grep -qE '^value\.serializer=io\.confluent\.kafka\.serializers\.KafkaAvroSerializer\s*$' "$STUB"
check "schema.registry.url is set"           grep -qE '^schema\.registry\.url=http://schema-registry:8081\s*$' "$STUB"
check "auto.register.schemas is false"       grep -qE '^auto\.register\.schemas=false\s*$' "$STUB"
check "compatibility-mode is BACKWARD"       grep -qE '^#\s*compatibility-mode\s*=\s*BACKWARD\s*$' "$STUB"
check "evolution-rule requires defaults"     grep -qE '^#\s*evolution-rule\s*=\s*new-fields-must-have-defaults\s*$' "$STUB"
check "auto-register not silently true"      bash -c "! grep -qE '^auto\.register\.schemas=true\s*\$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
