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

retention_section() {
  awk '/=== retention topic: clickstream-raw ===/{p=1; next} /=== compacted topic: user-profile-changelog ===/{p=0} p' "$STUB"
}
compacted_section() {
  awk '/=== compacted topic: user-profile-changelog ===/{p=1; next} p' "$STUB"
}
export STUB
export -f retention_section compacted_section

echo "Running retention-and-compaction tests against stub.properties..."

check "both section markers present" bash -c "
  grep -q '=== retention topic: clickstream-raw ===' '$STUB' &&
  grep -q '=== compacted topic: user-profile-changelog ===' '$STUB'
"

check "retention topic: cleanup.policy=delete"  bash -c "retention_section | grep -qE '^cleanup\.policy=delete\s*\$'"
check "retention topic: retention.ms 3 days"    bash -c "retention_section | grep -qE '^retention\.ms=259200000\s*\$'"
check "retention topic: segment.ms 1 hour"      bash -c "retention_section | grep -qE '^segment\.ms=3600000\s*\$'"
check "retention topic: no compact policy"      bash -c "! (retention_section | grep -qE '^cleanup\.policy=compact\s*\$')"

check "compacted topic: cleanup.policy=compact" bash -c "compacted_section | grep -qE '^cleanup\.policy=compact\s*\$'"
check "compacted topic: dirty ratio set"        bash -c "compacted_section | grep -qE '^min\.cleanable\.dirty\.ratio=0\.[0-9]+\s*\$'"
check "compacted topic: delete.retention.ms 24h" bash -c "compacted_section | grep -qE '^delete\.retention\.ms=86400000\s*\$'"
check "compacted topic: no time-based retention.ms" bash -c "! (compacted_section | grep -qE '^retention\.ms=')"

check "no leftover TODO comments"               bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
