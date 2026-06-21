#!/usr/bin/env bash

# classify_number: echo "positive", "negative", or "zero"
classify_number() {
  local n="$1"
  # TODO: use [[ ]] with numeric operators
}

# file_status: echo "directory", "file", "empty-file", or "missing"
file_status() {
  local path="$1"
  # TODO: use file test operators (-d, -f, -s, etc.)
}

# day_type: echo "weekday" or "weekend"
day_type() {
  local day="$1"
  # TODO: use a case statement
}

# --- main ---
classify_number 5
classify_number -3
classify_number 0
file_status "/tmp"
day_type "Saturday"
