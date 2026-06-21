#!/usr/bin/env bash

# run_parallel: run each arg as a shell command in background, wait for all
# Echo "all done" if all succeeded, "<N> failed" if any failed
run_parallel() {
  local pids=()
  # TODO: start each "$@" arg with eval ... & and collect PIDs
  # TODO: wait for each PID, count failures, echo result
}

# with_timeout: run cmd string, kill it after seconds, echo "ok" or "timeout"
with_timeout() {
  local seconds="$1"
  local cmd="$2"
  # TODO: start cmd in background, sleep in background, kill on timeout
}

# install_trap: run a subshell that sets an EXIT trap echoing "cleanup ran"
install_trap() {
  # TODO: use bash -c to run a subshell that traps EXIT
}

# --- main ---
run_parallel "echo a" "echo b" "echo c" > /dev/null
with_timeout 5 "echo fast"
install_trap
