# Loops

## What you'll learn

Lesson 2 covered branching on exit codes; loops reuse the same `[[ ]]`/`(( ))` conditions to repeat work. Bash has four loop forms: `for` (two flavors), `while`, and `until`. Each has a specific use case; knowing which to reach for saves time.

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

## Watch out

- `for x in $list` (unquoted) word-splits on every space **and** globs — a file named `report file.txt` becomes two loop iterations, and a value containing `*` expands to matching filenames. Quote list expansions you control (`"${arr[@]}"`); accept that raw word-splitting is the point for `for x in $(cmd)` only when you deliberately want word splits.
- `while read line; do ...; done < file` (no `IFS=`, no `-r`) strips leading/trailing whitespace from each line and mangles any backslashes. Always write `while IFS= read -r line; do ... done < file`.
- `i++` alone does nothing useful in Bash — it's parsed as a command name, not an operator. Increment with `((i++))` or `i=$((i + 1))`.
- `((expr))` returns a **non-zero exit code when `expr` evaluates to `0`** — under `set -e`, `(( count = 0 ))` will abort the script even though the assignment "succeeded". Use `(( count = 0 )) || true` or `count=0` for plain assignment when this matters.

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

You're writing three functions that use Bash's loop forms.

**`sum_range start end`** — echoes the sum of all integers from `start` to `end` inclusive. Use a C-style `for (( ))` loop.

```bash
sum_range 1 10   # 55
sum_range 5 10   # 45
sum_range 1 1    # 1   — single-element range
sum_range 0 0    # 0
```

**`count_lines filename`** — echoes the number of lines in the file. Use `while IFS= read -r`; do not use `wc`.

```bash
# file contains: line1\nline2\nline3\n
count_lines "$file"   # 3

# empty file
count_lines "$empty_file"   # 0
```

**`fizzbuzz n`** — echoes FizzBuzz output for 1 through `n`, one result per line: `Fizz` for multiples of 3, `Buzz` for multiples of 5, `FizzBuzz` for multiples of both, otherwise the number itself.

```bash
fizzbuzz 5
# 1
# 2
# Fizz
# 4
# Buzz

fizzbuzz 15   # 15th line is FizzBuzz (divisible by both 3 and 5)
```
