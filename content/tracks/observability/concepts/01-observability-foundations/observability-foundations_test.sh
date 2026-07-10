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

echo "Running observability-foundations tests against stub.yaml..."

check "global block present"                  grep -qE '^global:' "$STUB"
check "global scrape_interval 15s"             grep -qE 'scrape_interval:\s*15s' "$STUB"
check "global evaluation_interval 15s"         grep -qE 'evaluation_interval:\s*15s' "$STUB"
check "scrape_configs list present"            grep -qE '^scrape_configs:' "$STUB"
check "prometheus job defined"                 grep -qE "job_name:\s*'prometheus'" "$STUB"
check "prometheus target localhost:9090"       grep -q "localhost:9090" "$STUB"
check "web-app job defined"                    grep -qE "job_name:\s*'web-app'" "$STUB"
check "web-app scrape_interval override 10s"   grep -qE 'scrape_interval:\s*10s' "$STUB"
check "web-app target web-app:8080"            grep -q "web-app:8080" "$STUB"
check "static_configs used (at least twice)"   bash -c "[[ \$(grep -c 'static_configs:' '$STUB') -ge 2 ]]"
check "targets key used (at least twice)"      bash -c "[[ \$(grep -c 'targets:' '$STUB') -ge 2 ]]"
check "env: production label present"          grep -qE 'env:\s*production' "$STUB"
check "labels block present"                   grep -qE '^\s*labels:' "$STUB"
check "no leftover TODO comments"              bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
