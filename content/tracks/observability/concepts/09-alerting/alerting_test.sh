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

echo "Running alerting tests against stub.yaml..."

check "groups key present"                       grep -qE '^groups:' "$STUB"
check "group name web-app-slo-alerts"            grep -qE 'name:\s*web-app-slo-alerts' "$STUB"
check "ErrorBudgetBurnFast alert defined"        grep -q 'alert: ErrorBudgetBurnFast' "$STUB"
check "ErrorBudgetBurnSlow alert defined"        grep -q 'alert: ErrorBudgetBurnSlow' "$STUB"
check "fast alert uses 14.4 burn rate (twice)"   bash -c "[[ \$(grep -c '14.4' '$STUB') -ge 2 ]]"
check "fast alert uses 1h window"                grep -q 'ratio_rate1h' "$STUB"
check "fast alert uses 5m window"                grep -q 'ratio_rate5m' "$STUB"
check "fast alert combines windows with and"     grep -qE '^\s*and\s*$' "$STUB"
check "fast alert for: 2m"                        grep -qE 'for:\s*2m' "$STUB"
check "fast alert severity page"                  grep -qE 'severity:\s*page' "$STUB"
check "slow alert uses burn rate 6"               grep -qE '\(6 \* 0\.001\)' "$STUB"
check "slow alert uses 6h window"                 grep -q 'ratio_rate6h' "$STUB"
check "slow alert uses 30m window"                grep -q 'ratio_rate30m' "$STUB"
check "slow alert for: 15m"                       grep -qE 'for:\s*15m' "$STUB"
check "slow alert severity ticket"                grep -qE 'severity:\s*ticket' "$STUB"
check "annotations template \$labels.job"         grep -q '{{ $labels.job }}' "$STUB"
check "annotations template humanizePercentage"   grep -q 'humanizePercentage' "$STUB"
check "runbook_url annotation present"            grep -q 'runbook_url' "$STUB"
check "no leftover TODO comments"                 bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
