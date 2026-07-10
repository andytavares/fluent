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

export DOC1="$(awk '/^---$/{exit} {print}' "$STUB")"
export DOC2="$(awk 'f{print} /^---$/{f=1}' "$STUB")"

grep_doc1() { printf '%s\n' "$DOC1" | grep -qE "$1"; }
grep_doc2() { printf '%s\n' "$DOC2" | grep -qE "$1"; }

echo "Running resources-qos tests against stub.yaml..."

check "two documents separated by ---" bash -c "[[ \$(grep -c '^---$' '$STUB') -ge 1 ]]"
check "doc1 pod name guaranteed-app"  grep_doc1 '^\s*name:\s*guaranteed-app\s*$'
check "doc2 pod name burstable-app"   grep_doc2 '^\s*name:\s*burstable-app\s*$'

check "doc1 requests.cpu 500m"        grep_doc1 '^\s*cpu:\s*"500m"\s*$'
check "doc1 requests.memory 256Mi"    grep_doc1 '^\s*memory:\s*"256Mi"\s*$'
check "doc1 limits.cpu 500m (>=2 occurrences of 500m in doc1)" bash -c "
  count=\$(printf '%s\n' \"\$DOC1\" | grep -cE '^\s*cpu:\s*\"500m\"\s*\$')
  [[ \$count -ge 2 ]]
"
check "doc1 limits.memory 256Mi (>=2 occurrences of 256Mi in doc1)" bash -c "
  count=\$(printf '%s\n' \"\$DOC1\" | grep -cE '^\s*memory:\s*\"256Mi\"\s*\$')
  [[ \$count -ge 2 ]]
"

check "doc2 requests.cpu 250m"        grep_doc2 '^\s*cpu:\s*"250m"\s*$'
check "doc2 requests.memory 128Mi"    grep_doc2 '^\s*memory:\s*"128Mi"\s*$'
check "doc2 limits.cpu 500m"          grep_doc2 '^\s*cpu:\s*"500m"\s*$'
check "doc2 limits.memory 256Mi"      grep_doc2 '^\s*memory:\s*"256Mi"\s*$'
check "doc2 requests != limits (Burstable, not Guaranteed)" bash -c "
  req_cpu=\$(printf '%s\n' \"\$DOC2\" | grep -cE '^\s*cpu:\s*\"250m\"\s*\$')
  lim_cpu=\$(printf '%s\n' \"\$DOC2\" | grep -cE '^\s*cpu:\s*\"500m\"\s*\$')
  [[ \$req_cpu -ge 1 && \$lim_cpu -ge 1 ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
