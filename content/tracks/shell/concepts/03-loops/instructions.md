## What you build

You write three functions with Bash loops: a range sum, a line counter and FizzBuzz. Loops use the same `[[ ]]` and `(( ))` conditions as branches. This lesson builds on **Control Flow**.

## Key concepts

### `for` walks a list of words

The list can be literal words, a glob or the output of a command.

```bash
for fruit in apple banana cherry; do
  echo "$fruit"
done

# Over the files that match a glob
for file in *.log; do
  echo "processing $file"
done

# Over the output of a command
for user in $(cut -d: -f1 /etc/passwd)
do
  echo "$user"
done
```

### C-style `for` counts with arithmetic

```bash
for (( i = 0; i < 5; i++ )); do
  echo "i=$i"
done
```

### Brace expansion makes a range

`{1..10}` expands to the numbers 1 to 10. A third number sets the step. Other languages write `range(10)` or `0..10`.

```bash
for i in {1..10}; do
  echo "$i"
done

# Step of 5: 0 5 10 15 20
for i in {0..20..5}; do
  echo "$i"
done
```

### `while` runs while its condition exits 0

```bash
count=0
while [[ $count -lt 5 ]]; do
  echo "$count"
  ((count++))
done
```

### `while IFS= read -r` reads a file line by line

`IFS=` keeps leading and trailing whitespace. `-r` keeps backslashes as they are. This is the standard way to read a file one line at a time.

```bash
while IFS= read -r line; do
  echo "line: $line"
done < input.txt
```

### `until` runs while its condition exits non-zero

`until` is the inverse of `while`.

```bash
until [[ -f /tmp/ready ]]; do
  sleep 1
done
```

### `break` leaves the loop, `continue` skips one pass

```bash
for i in {1..10}; do
  # Leave the loop
  [[ $i -eq 5 ]] && break
  # Skip even numbers
  (( i % 2 == 0 )) && continue
  echo "$i"
done
```

### Loop variables are global

Bash has no block scope. The loop variable keeps its last value after the loop ends.

## Watch out

- Unquoted `for x in $list` splits on every space and expands globs.
- So a file named `report file.txt` gives two passes, and a `*` expands to file names.
- Quote the lists you control: `"${arr[@]}"`. Use unquoted `$(cmd)` only when you want the split.
- `while read line` with no `IFS=` and no `-r` strips whitespace and changes backslashes.
- Always write `while IFS= read -r line`.
- `i++` alone does not increment. Bash runs it as a command named `i++`.
- Write `((i++))` or `i=$((i + 1))`.
- `((expr))` exits non-zero when `expr` is 0.
- Under `set -e`, `(( count = 0 ))` stops the script. Write `count=0`, or add `|| true`.

## The task

Write three functions, each with a different loop form.

1. `sum_range start end` prints the sum of the integers from `start` to `end`, both included.
2. In `sum_range`, use a C-style `for (( ))` loop.
3. `count_lines filename` prints the number of lines in the file.
4. In `count_lines`, use `while IFS= read -r`. Do not use `wc`.
5. `fizzbuzz n` prints one line for each number from 1 to `n`.
6. A multiple of 3 and 5 gives `FizzBuzz`.
7. A multiple of 3 only gives `Fizz`.
8. A multiple of 5 only gives `Buzz`.
9. Any other number gives the number itself.

A range with one number sums to that number. An empty file has 0 lines.

```bash
sum_range 1 10   # 55
sum_range 5 10   # 45
sum_range 1 1    # 1
sum_range 0 0    # 0

printf "line1\nline2\nline3\n" > "$f"
count_lines "$f"   # 3
printf "only one\n" > "$f"
count_lines "$f"   # 1
printf "" > "$f"
count_lines "$f"   # 0

fizzbuzz 15
# 1
# 2
# Fizz
# 4
# Buzz
# Fizz
# ...
# Buzz (line 10)
# ...
# FizzBuzz (line 15)
```
