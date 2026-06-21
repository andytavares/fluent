# Arrays

## What you'll learn

Bash has two array types: indexed (like a list) and associative (like a map). Both have non-obvious expansion syntax that you must get right or you'll spend hours debugging word-splitting bugs.

## Key concepts

**Indexed arrays:**

```bash
fruits=("apple" "banana" "cherry")
fruits+=("date")              # append
fruits[10]="elderberry"       # sparse — index 10, gaps are fine

echo "${fruits[0]}"           # apple
echo "${fruits[@]}"           # all elements, each as a separate word
echo "${#fruits[@]}"          # count: 4 (sparse still has 4 elements)
echo "${!fruits[@]}"          # indices: 0 1 2 10
```

**Always use `"${arr[@]}"` — never `$arr` or `${arr[*]}`:**

```bash
# Wrong — treats whole array as one string, splits on spaces in values
for f in ${fruits[@]}; do ...

# Right — each element is its own quoted word
for f in "${fruits[@]}"; do
  echo "$f"
done
```

`"${arr[*]}"` joins all elements into a single string with IFS. Useful for `join_by`-style printing, but loses element boundaries.

**Slicing:**

```bash
echo "${fruits[@]:1:2}"   # elements 1 and 2 → banana cherry
echo "${fruits[@]:2}"     # from index 2 to end
```

**Reading lines into an array:**

```bash
mapfile -t lines < file.txt        # one element per line, strips newlines
readarray -t words <<< "a b c"    # same as mapfile; readarray is an alias
```

**Associative arrays (requires `declare -A`):**

```bash
declare -A scores
scores["alice"]=95
scores["bob"]=82
scores+=( ["carol"]=78 )

echo "${scores["alice"]}"      # 95
echo "${!scores[@]}"           # keys (unordered): alice bob carol
echo "${scores[@]}"            # values (unordered)

for key in "${!scores[@]}"; do
  echo "$key → ${scores[$key]}"
done
```

Associative arrays require Bash 4+. macOS ships Bash 3 by default — always run scripts with `#!/usr/bin/env bash` and ensure Bash 4+ is installed if you use `declare -A`.

## vs other languages

| Concept | Python/JS | Bash |
|---------|-----------|------|
| Declaration | `arr = []` | `arr=()` |
| Length | `len(arr)` / `arr.length` | `${#arr[@]}` |
| Append | `arr.append(x)` / `arr.push(x)` | `arr+=("$x")` |
| Iteration | `for x in arr` | `for x in "${arr[@]}"` — quotes matter |
| Map/dict | `{}` / `new Map()` | `declare -A map` (Bash 4+) |
| Slice | `arr[1:3]` | `"${arr[@]:1:2}"` |
| Splat/spread | `*arr` / `...arr` | `"${arr[@]}"` |

## The task

Implement three functions:

**`array_sum [numbers...]`** — accepts any number of integer arguments and echoes their sum.

**`unique_sorted [words...]`** — accepts any number of word arguments, removes duplicates, sorts them, and echoes one word per line.

**`invert_map [key=value...]`** — accepts arguments in `key=value` format, and echoes them inverted as `value=key`, one per line. Order should follow the order of input arguments.
