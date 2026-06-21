#!/usr/bin/env bash

# greet: print "Hello, <name>!"
greet() {
  local name="$1"
  # TODO: echo the greeting
}

# describe_file: print "File: <basename> (ext: <extension>)"
# Use parameter expansion only — no basename/dirname commands.
describe_file() {
  local path="$1"
  # TODO: extract basename and extension, then echo the result
}

# repeat_word: echo word repeated n times, space-separated
repeat_word() {
  local word="$1"
  local n="$2"
  # TODO: build and echo the repeated string
}

# --- main (run to see output) ---
greet "World"
describe_file "/tmp/report.txt"
repeat_word "hi" 3
