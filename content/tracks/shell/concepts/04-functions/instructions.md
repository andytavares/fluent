# Functions

## What you'll learn

Bash functions look like functions in other languages but behave differently in three important ways: arguments are positional (not named), return values are exit codes (not data), and all variables are global unless explicitly declared `local`.

## Key concepts

**Two equivalent declaration syntaxes:**

```bash
# POSIX-compatible
greet() {
  echo "Hello, $1"
}

# Bash keyword form
function greet {
  echo "Hello, $1"
}
```

Both work. The `name()` form is more portable; the `function` keyword is Bash-specific. Pick one and be consistent.

**Positional arguments — `$1`, `$2`, ... `$@`:**

```bash
add() {
  local a="$1"
  local b="$2"
  echo $(( a + b ))
}
add 3 4   # prints 7

log() {
  local level="$1"
  shift            # drop $1; $@ now contains remaining args
  echo "[$level] $*"
}
log INFO "server started on port" 8080
# → [INFO] server started on port 8080
```

`$@` — all args as separate quoted words (use this for passing args along)
`$*` — all args joined by IFS (use this for printing)
`$#` — count of args

**`local` — always use it:**

```bash
counter=0   # global

increment() {
  local counter=0   # shadows the global — doesn't modify it
  ((counter++))
  echo "$counter"   # always 1
}
```

Without `local`, every variable you set inside a function modifies the global scope. This is one of Bash's most dangerous defaults.

**Return values — exit codes, not data:**

```bash
is_even() {
  local n="$1"
  (( n % 2 == 0 ))   # exits 0 if true, 1 if false
}

if is_even 4; then echo "yes"; fi

# To return data, echo it and capture with $()
double() {
  echo $(( $1 * 2 ))
}
result=$(double 21)   # result="42"
```

`return N` sets the exit code (0–255). To pass data back, `echo` it and capture with `$()`.

**Recursive functions work:**

```bash
factorial() {
  local n="$1"
  if (( n <= 1 )); then
    echo 1
  else
    echo $(( n * $(factorial $((n - 1))) ))
  fi
}
```

## vs other languages

| Concept | Most languages | Bash |
|---------|---------------|------|
| Named parameters | `def greet(name, age)` | No — only positional `$1`, `$2` |
| Return value | `return x` returns data | `return N` returns exit code only; data goes via `echo` |
| Variable scope | Block/function scoped | Global by default — `local` opts in to function scope |
| Overloading | Many languages support it | Not possible — one definition per name |
| First-class functions | JS, Python, Go, etc. | Functions can be passed by name, but no closures |

The most impactful habit to build: always `local` every variable in a function. One unintentional global collision can cause hours of debugging.

## The task

Implement three functions:

**`max a b`** — echoes the larger of two integers.

**`join_by separator [words...]`** — echoes all remaining arguments joined by `separator`. Example: `join_by , a b c` → `a,b,c`. Use `shift` to consume the separator first.

**`repeat_func func n`** — calls the named function `n` times, passing the iteration number (1-based) as its argument. Example: `repeat_func echo 3` prints `1`, `2`, `3` on separate lines. Use `"$func"` to call it dynamically.
