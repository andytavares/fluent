## What you build

You write `array_sum`, `unique_sorted` and `invert_map`, which treat the caller's arguments as a list. Bash has indexed arrays, like a list, and associative arrays, like a map. This lesson builds on **Functions**.

## Key concepts

### An indexed array holds a list

Create it with `arr=()`, and append with `arr+=("$x")`. Indexes can have gaps. `${#arr[@]}` counts the elements, and `${!arr[@]}` lists the indexes.

```bash
fruits=("apple" "banana" "cherry")
# Append
fruits+=("date")
# Index 10; the gap is fine
fruits[10]="elderberry"

# apple
echo "${fruits[0]}"
# All elements, each as its own word
echo "${fruits[@]}"
# Count: 5
echo "${#fruits[@]}"
# Indexes: 0 1 2 3 10
echo "${!fruits[@]}"
```

### `"${arr[@]}"` keeps each element whole

Always write `"${arr[@]}"`, with the quotes. It gives each element as one word, like `*arr` in Python or `...arr` in JavaScript. Never write `$arr` or `${arr[*]}` to loop.

```bash
# Wrong: splits values that contain spaces
for f in ${fruits[@]}; do ...

# Right: one word for each element
for f in "${fruits[@]}"; do
  echo "$f"
done
```

### `"${arr[*]}"` joins the elements into one string

It joins with the first character of `IFS`. It is useful to print a line, but it loses the element boundaries.

### Slices take a range of elements

`"${arr[@]:1:2}"` is the same as `arr[1:3]` in Python.

```bash
# Elements 1 and 2: banana cherry
echo "${fruits[@]:1:2}"
# From index 2 to the end
echo "${fruits[@]:2}"
```

### `mapfile` reads lines into an array

`-t` removes the newline from each line. `readarray` is another name for `mapfile`.

```bash
# One element for each line
mapfile -t lines < file.txt
readarray -t words <<< "a b c"
```

### An associative array holds a map

Declare it with `declare -A`. It needs Bash 4 or later. Keys have no order.

```bash
declare -A scores
scores["alice"]=95
scores["bob"]=82
scores+=( ["carol"]=78 )

# 95
echo "${scores["alice"]}"
# Keys, in no order
echo "${!scores[@]}"
# Values, in no order
echo "${scores[@]}"

for key in "${!scores[@]}"; do
  echo "$key -> ${scores[$key]}"
done
```

macOS ships Bash 3 by default. Start scripts with `#!/usr/bin/env bash`, and install Bash 4 or later to use `declare -A`.

## Watch out

- Unquoted `${arr[@]}` splits and globs every element. An element with a space becomes two in a `for` loop.
- `${arr[*]}`, even in quotes, joins all elements into one string with `$IFS`.
- It is useful to print one line, and useless to loop, because element boundaries are lost.
- `${#arr[@]}` counts elements, not the highest index.
- An array with elements only at indexes 0 and 10 has a count of 2, not 11.
- `for w in $@` has the same bug. It also splits on whitespace inside each argument.

## The task

Write three functions that treat `"$@"`, the caller's arguments, as a list.

1. `array_sum number...` prints the sum of its integer arguments. With no arguments, it prints `0`.
2. `unique_sorted word...` removes duplicate words and sorts the rest in lexical order.
3. It prints one word per line.
4. `invert_map key=value...` prints each pair as `value=key`, one per line, in input order.
5. Split each pair on the first `=` only. A value that contains `=` stays whole.

```bash
array_sum 1 2 3 4 5   # 15
array_sum 7           # 7
array_sum             # 0
array_sum -5 3 2      # 0

unique_sorted banana apple apple \
  cherry banana
# apple
# banana
# cherry
unique_sorted x x x   # x
unique_sorted only    # only

invert_map a=1 b=2 c=3
# 1=a
# 2=b
# 3=c
invert_map key=hello  # hello=key
# Key "a", value "b=c"
invert_map a=b=c      # b=c=a
```
