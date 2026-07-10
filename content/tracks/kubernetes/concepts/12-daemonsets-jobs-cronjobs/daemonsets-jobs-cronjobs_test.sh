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

echo "Running daemonsets-jobs-cronjobs tests against stub.yaml..."

check "kind DaemonSet present"        grep -qE '^kind:\s*DaemonSet\s*$'               "$STUB"
check "kind Job present"              grep -qE '^kind:\s*Job\s*$'                     "$STUB"
check "kind CronJob present"          grep -qE '^kind:\s*CronJob\s*$'                 "$STUB"
check "daemonset name log-agent"      grep -qE '^\s*name:\s*log-agent\s*$'            "$STUB"
check "daemonset container image fluentd:1.16" grep -qE '^\s*image:\s*fluentd:1\.16\s*$' "$STUB"
check "job name db-migrate"           grep -qE '^\s*name:\s*db-migrate\s*$'           "$STUB"
check "job completions 1"             grep -qE '^\s*completions:\s*1\s*$'             "$STUB"
check "job parallelism 1"             grep -qE '^\s*parallelism:\s*1\s*$'             "$STUB"
check "job backoffLimit 3"            grep -qE '^\s*backoffLimit:\s*3\s*$'            "$STUB"
check "job ttlSecondsAfterFinished 3600" grep -qE '^\s*ttlSecondsAfterFinished:\s*3600\s*$' "$STUB"
check "job image migrate:1.0"         grep -qE '^\s*image:\s*migrate:1\.0\s*$'        "$STUB"
check "restartPolicy OnFailure appears twice (Job + CronJob)" bash -c \
  "[[ \$(grep -cE '^\s*restartPolicy:\s*OnFailure\s*\$' '$STUB') -ge 2 ]]"
check "cronjob name nightly-backup"   grep -qE '^\s*name:\s*nightly-backup\s*$'       "$STUB"
check "cronjob schedule 0 2 * * *"    grep -qE '^\s*schedule:\s*"0 2 \* \* \*"\s*$'   "$STUB"
check "cronjob concurrencyPolicy Forbid" grep -qE '^\s*concurrencyPolicy:\s*Forbid\s*$' "$STUB"
check "cronjob startingDeadlineSeconds 300" grep -qE '^\s*startingDeadlineSeconds:\s*300\s*$' "$STUB"
check "cronjob container image backup:1.0" grep -qE '^\s*image:\s*backup:1\.0\s*$'    "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
