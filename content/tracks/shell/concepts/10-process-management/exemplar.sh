#!/usr/bin/env bash

run_parallel() {
  local pids=()
  for cmd in "$@"; do
    eval "$cmd" &
    pids+=($!)
  done

  local failed=0
  for pid in "${pids[@]}"; do
    wait "$pid" || (( failed++ ))
  done

  if [[ $failed -eq 0 ]]; then
    echo "all done"
  else
    echo "${failed} failed"
  fi
}

with_timeout() {
  local seconds="$1"
  local cmd="$2"

  eval "$cmd" &
  local cmd_pid=$!

  (
    sleep "$seconds"
    kill "$cmd_pid" 2>/dev/null
  ) &
  local timer_pid=$!

  if wait "$cmd_pid" 2>/dev/null; then
    kill "$timer_pid" 2>/dev/null
    wait "$timer_pid" 2>/dev/null || true
    echo "ok"
  else
    echo "timeout"
  fi
}

install_trap() {
  bash -c 'trap "echo cleanup ran" EXIT; exit 0'
}

# --- main ---
run_parallel "echo a" "echo b" "echo c" > /dev/null
with_timeout 5 "echo fast"
install_trap
