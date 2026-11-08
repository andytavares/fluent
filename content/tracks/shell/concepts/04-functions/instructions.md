## What you build

You write `max`, `join_by` and `repeat_func`. They use positional arguments, `shift` and a call to a function by its name. This lesson builds on **Loops**.

## Key concepts

### Bash has two ways to declare a function

The `name()` form is POSIX and more portable. The `function` keyword is Bash only. Pick one and use it everywhere.

```bash
# POSIX form
greet() {
  echo "Hello, $1"
}

# Bash keyword form
function greet {
  echo "Hello, $1"
}
```

### Arguments are positional

A function has no named parameters, only `$1`, `$2` and so on. Copy them into named `local` variables at the top.

```bash
add() {
  local a="$1"
  local b="$2"
  echo $(( a + b ))
}
# Prints 7
add 3 4
```

### `shift` drops the first argument

After `shift`, `$2` becomes `$1`, and `$@` holds the rest. `$@` gives each argument as a separate word, so use it to pass arguments on. `$*` joins them with `IFS`, so use it to print. `$#` is the count.

```bash
log() {
  local level="$1"
  shift
  echo "[$level] $*"
}
log INFO "server started on port" 8080
# [INFO] server started on port 8080
```

### Variables are global unless you declare them `local`

Without `local`, every variable you set in a function changes the global one. This is one of the most dangerous defaults in Bash.

```bash
# Global
counter=0

increment() {
  # Hides the global; does not change it
  local counter=0
  ((counter++))
  # Always 1
  echo "$counter"
}
```

### A function returns an exit code, not data

The exit code of the last command is the return value. `return N` sets it to a number from 0 to 255. To give back data, `echo` it and capture it with `$()`.

```bash
is_even() {
  local n="$1"
  # Exits 0 if true, 1 if false
  (( n % 2 == 0 ))
}

if is_even 4; then echo "yes"; fi

double() {
  echo $(( $1 * 2 ))
}
# result="42"
result=$(double 21)
```

### Functions can call themselves

```bash
factorial() {
  local n="$1"
  if (( n <= 1 )); then
    echo 1
  else
    local rest
    rest=$(factorial $(( n - 1 )))
    echo $(( n * rest ))
  fi
}
```

### A function name is a string you can call

You can pass a function by its name and run it with `"$func"`. Bash has no closures. A name has one definition, so overloading is not possible.

## Watch out

- A variable without `local` leaks into the caller's scope.
- Bash scope is dynamic, so it also leaks into every caller further up the stack.
- A helper's loop variable `i` can overwrite the caller's `i`.
- `return` sets only the exit code, from 0 to 255. `return 300` gives 44 (`300 % 256`).
- For larger numbers or text, `echo` the value and capture it with `$()`.
- Bash reads a script from top to bottom and has no hoisting.
- A call before the definition fails. Define functions before the code that calls them.
- An unquoted argument passed through several functions splits into words.
- Quote every expansion you pass on: `other_func "$1"`, not `other_func $1`.

## The task

Write three functions that use positional arguments, `shift` and a call by name.

1. `max a b` prints the larger of two integers. When they are equal, it prints that value.
2. `join_by separator word...` prints the words after the first argument, joined by `separator`.
3. In `join_by`, use `shift` to remove the separator, then loop over the rest.
4. `repeat_func func n` calls the function named `func` `n` times.
5. Each call gets the pass number as its only argument, from 1 to `n`.
6. Call it with `"$func" "$i"`.

With one word, `join_by` prints the word and no separator. With no words, it prints an empty line. When `n` is 0, `repeat_func` prints nothing.

```bash
max 9 3    # 9
max 3 9    # 9
max 5 5    # 5
max -3 0   # 0

join_by , a b c    # a,b,c
join_by - x y z    # x-y-z
join_by ' ' a b    # a b
join_by , solo     # solo
join_by ,          # (an empty line)

repeat_func echo 3
# 1
# 2
# 3
repeat_func echo 0
# (nothing)
```
