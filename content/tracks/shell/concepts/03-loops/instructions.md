# Loops

## What you'll learn

Bash has four loop forms: `for` (two flavors), `while`, and `until`. Each has a specific use case; knowing which to reach for saves time.

## Key concepts

**`for` over a list:**

```bash
for fruit in apple banana cherry; do
  echo "$fruit"
done

# Over command output
for file in *.log; do
  echo "processing $file"
done

# Over command substitution
for user in $(cut -d: -f1 /etc/passwd); do
  echo "$user"
done
```

**C-style `for` with arithmetic:**

```bash
for (( i = 0; i < 5; i++ )); do
  echo "i=$i"
done
```

**Brace expansion range:**

```bash
for i in {1..10}; do
  echo "$i"
done

for i in {0..20..5}; do   # step of 5
  echo "$i"
done
```

**`while` — runs while condition exits 0:**

```bash
count=0
while [[ $count -lt 5 ]]; do
  echo "$count"
  ((count++))
done

# Read lines from a file
while IFS= read -r line; do
  echo "line: $line"
done < input.txt
```

`IFS=` prevents leading/trailing whitespace stripping. `-r` prevents backslash interpretation. This is the canonical way to read a file line by line.

**`until` — runs while condition exits non-zero (the inverse of `while`):**

```bash
until [[ -f /tmp/ready ]]; do
  sleep 1
done
```

**`break` and `continue`:**

```bash
for i in {1..10}; do
  [[ $i -eq 5 ]] && break      # exit loop entirely
  [[ $(( i % 2 )) -eq 0 ]] && continue  # skip even numbers
  echo "$i"
done
```

## vs other languages

| Concept | Python/JS/Go | Bash |
|---------|-------------|------|
| `for` over list | `for x in items` | `for x in item1 item2` (word-split) or `"${arr[@]}"` for arrays |
| Range | `range(10)` / `0..10` | `{0..9}` brace expansion or C-style `(( ))` |
| Increment | `i++` | `((i++))` or `i=$((i+1))` — `i++` alone does nothing |
| Reading lines | file.readlines() | `while IFS= read -r line; do ... done < file` |
| Loop variable scope | block-scoped in many languages | global — Bash has no block scope |

The most common mistake: forgetting `IFS= read -r` when processing files. Bare `read line` mangles whitespace and backslashes.

## The task

Implement three functions:

**`sum_range start end`** — echoes the sum of all integers from `start` to `end` inclusive. Use a C-style for loop.

**`count_lines filename`** — echoes the number of lines in the file. Use `while IFS= read -r`. Do not use `wc`.

**`fizzbuzz n`** — echoes FizzBuzz output for 1 through `n`, one result per line: `Fizz` (divisible by 3), `Buzz` (divisible by 5), `FizzBuzz` (both), or the number itself.
