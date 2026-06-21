#!/usr/bin/env bash

sum_range() {
  local start="$1"
  local end="$2"
  local total=0
  for (( i = start; i <= end; i++ )); do
    (( total += i ))
  done
  echo "$total"
}

count_lines() {
  local filename="$1"
  local count=0
  while IFS= read -r; do
    (( count++ ))
  done < "$filename"
  echo "$count"
}

fizzbuzz() {
  local n="$1"
  for (( i = 1; i <= n; i++ )); do
    if (( i % 15 == 0 )); then
      echo "FizzBuzz"
    elif (( i % 3 == 0 )); then
      echo "Fizz"
    elif (( i % 5 == 0 )); then
      echo "Buzz"
    else
      echo "$i"
    fi
  done
}

# --- main ---
sum_range 1 10
count_lines "$0"
fizzbuzz 15
