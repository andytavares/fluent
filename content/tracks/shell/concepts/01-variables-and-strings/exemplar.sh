#!/usr/bin/env bash

greet() {
  local name="$1"
  echo "Hello, ${name}!"
}

describe_file() {
  local path="$1"
  local base="${path##*/}"   # strip everything up to last /
  local ext="${base##*.}"    # strip everything up to last .
  echo "File: ${base} (ext: ${ext})"
}

repeat_word() {
  local word="$1"
  local n="$2"
  local result=""
  for (( i = 0; i < n; i++ )); do
    result="${result:+${result} }${word}"
  done
  echo "$result"
}

# --- main ---
greet "World"
describe_file "/tmp/report.txt"
repeat_word "hi" 3
