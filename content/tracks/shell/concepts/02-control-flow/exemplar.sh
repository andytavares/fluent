#!/usr/bin/env bash

classify_number() {
  local n="$1"
  if [[ $n -gt 0 ]]; then
    echo "positive"
  elif [[ $n -lt 0 ]]; then
    echo "negative"
  else
    echo "zero"
  fi
}

file_status() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    echo "missing"
  elif [[ -d "$path" ]]; then
    echo "directory"
  elif [[ ! -s "$path" ]]; then
    echo "empty-file"
  else
    echo "file"
  fi
}

day_type() {
  local day="$1"
  case "$day" in
    Saturday|Sunday)
      echo "weekend"
      ;;
    Monday|Tuesday|Wednesday|Thursday|Friday)
      echo "weekday"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# --- main ---
classify_number 5
classify_number -3
classify_number 0
file_status "/tmp"
day_type "Saturday"
