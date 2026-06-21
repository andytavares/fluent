#!/usr/bin/env bash

# sum_range: echo sum of integers from start to end inclusive
sum_range() {
  local start="$1"
  local end="$2"
  # TODO: use C-style for loop with (( ))
}

# count_lines: echo the number of lines in filename
# Must use while IFS= read -r — not wc
count_lines() {
  local filename="$1"
  # TODO: read line by line and count
}

# fizzbuzz: echo FizzBuzz for 1..n
fizzbuzz() {
  local n="$1"
  # TODO: loop 1..n, apply FizzBuzz rules
}

# --- main ---
sum_range 1 10
count_lines "$0"
fizzbuzz 15
