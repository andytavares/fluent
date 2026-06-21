#!/usr/bin/env bash

max() {
  local a="$1"
  local b="$2"
  if [[ $a -ge $b ]]; then
    echo "$a"
  else
    echo "$b"
  fi
}

join_by() {
  local sep="$1"
  shift
  local result=""
  for word in "$@"; do
    result="${result:+${result}${sep}}${word}"
  done
  echo "$result"
}

repeat_func() {
  local func="$1"
  local n="$2"
  for (( i = 1; i <= n; i++ )); do
    "$func" "$i"
  done
}

# --- main ---
max 3 7
join_by , apple banana cherry
repeat_func echo 3
