#!/usr/bin/env bash

array_sum() {
  local total=0
  for n in "$@"; do
    (( total += n ))
  done
  echo "$total"
}

unique_sorted() {
  printf '%s\n' "$@" | sort -u
}

invert_map() {
  for pair in "$@"; do
    local key="${pair%%=*}"
    local val="${pair#*=}"
    echo "${val}=${key}"
  done
}

# --- main ---
array_sum 1 2 3 4 5
unique_sorted banana apple apple cherry banana
invert_map a=1 b=2 c=3
