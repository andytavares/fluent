# Error Handling

## What you'll learn

Elixir has two error models that coexist intentionally. Tagged tuples (`{:ok, value}` / `{:error, reason}`) are for expected failure paths. Exceptions (`raise` / `rescue`) are for truly unexpected conditions. The `with` expression threads multiple tagged-tuple operations cleanly.

## Key concepts

**Tagged tuples — the primary pattern:**

```elixir
def parse_age(str) do
  case Integer.parse(str) do
    {n, ""} when n >= 0 -> {:ok, n}
    _                   -> {:error, "invalid age: #{str}"}
  end
end

case parse_age("30") do
  {:ok, age}     -> "Age is #{age}"
  {:error, msg}  -> "Failed: #{msg}"
end
```

This is the idiomatic Elixir way to signal recoverable errors. No exceptions involved. The caller is forced to handle both branches.

**`with` for chaining multiple fallible operations:**

```elixir
with {:ok, raw}  <- File.read("config.json"),
     {:ok, data} <- Jason.decode(raw),
     {:ok, port} <- Map.fetch(data, "port") do
  {:ok, port}
else
  {:error, reason} -> {:error, reason}
  :error           -> {:error, "missing key"}
end
```

`with` short-circuits at the first clause that doesn't match its left-hand pattern and falls through to `else`. Without `with`, the equivalent nested `case` is deeply indented.

**Exceptions for unexpected conditions:**

```elixir
raise ArgumentError, "n must be positive"
raise "something broke"   # raises RuntimeError

try do
  risky_operation()
rescue
  ArgumentError -> "bad argument"
  e in RuntimeError -> "runtime: #{Exception.message(e)}"
end
```

`rescue` catches exceptions by type. Use exceptions for programmer errors and truly unexpected states — not for control flow.

**Bang functions (`!` suffix):**

By convention, `File.read!/1` raises on failure where `File.read/1` returns `{:error, reason}`. Most standard library modules follow this pattern: the `!` variant is for "I expect this to succeed — crash if not."

```elixir
content = File.read!("known_file.txt")  # raises on error
{:ok, content} = File.read("maybe.txt") # pattern-match to handle
```

## vs other languages

| | Elixir | Go | Python | Java |
|---|---|---|---|---|
| Expected failures | `{:ok, v}` / `{:error, r}` | `(T, error)` | exception or `Optional` | checked exception / `Optional` |
| Unexpected failures | `raise` / `rescue` | `panic` / `recover` | exception | unchecked exception |
| Chaining fallible ops | `with` | manual `if err != nil` | nested `try` | method chaining |
| "Crash is fine" mindset | yes — processes are isolated | no | no | no |

The philosophical difference: Elixir encourages "let it crash" for unexpected failures. Because processes are isolated, a crash doesn't take down the system — a supervisor restarts the failed process. This means you should write less defensive code, not more.

## Watch out

- `with`'s `<-` clauses only short-circuit on **pattern mismatch**, not on any falsy value — `false <- some_call()` does *not* short-circuit if `some_call()` returns `false` and the pattern is a bare variable (it would just bind). Always match a specific shape like `{:ok, _}` to get short-circuiting behavior.
- Mixing tagged-tuple returns with exceptions inconsistently is worse than picking one: if `divide/2` can fail with `{:error, _}`, don't also let it raise `ArithmeticError` for some inputs — callers need one contract to pattern-match against.
- `Integer.parse/1` is lenient: `Integer.parse("42abc")` succeeds and returns `{42, "abc"}` rather than failing — you must check that the leftover string is `""` if you want to reject trailing garbage.

## The task

Implement these functions in the `SafeMath` module, all following the `{:ok, value}` / `{:error, reason}` convention.

**`divide(a, b)`** — returns `{:ok, a / b}`, or `{:error, "division by zero"}` when `b` is `0`.

```elixir
SafeMath.divide(10, 2)  # => {:ok, 5.0}
SafeMath.divide(10, 0)  # => {:error, "division by zero"}
SafeMath.divide(-6, 2)  # => {:ok, -3.0}
```

**`sqrt(n)`** — returns `{:ok, result}` for non-negative `n`, or `{:error, "cannot take sqrt of negative number"}` otherwise.

```elixir
SafeMath.sqrt(9.0)   # => {:ok, 3.0}
SafeMath.sqrt(0)     # => {:ok, 0.0}
SafeMath.sqrt(-1.0)  # => {:error, "cannot take sqrt of negative number"}
```

**`safe_pipeline(a, b, c)`** — divides `a` by `b`, takes the square root of that result, then divides by `c`, using `with` to chain the three fallible steps. Returns `{:ok, result}`, or the first `{:error, reason}` encountered along the way (from whichever step failed).

```elixir
# 100 / 4 = 25, sqrt(25) = 5, 5 / 2 = 2.5
SafeMath.safe_pipeline(100.0, 4.0, 2.0)   # => {:ok, 2.5}
SafeMath.safe_pipeline(100.0, 0, 2.0)     # => {:error, "division by zero"}   — b is 0
SafeMath.safe_pipeline(100.0, 4.0, 0)     # => {:error, "division by zero"}   — c is 0
SafeMath.safe_pipeline(-100.0, 4.0, 2.0)  # => {:error, "cannot take sqrt of negative number"}
```

**`parse_positive_int(str)`** — parses a string to an integer. Returns `{:ok, n}` only if the entire string is a valid integer and `n > 0`; otherwise `{:error, reason}` with a reason describing what went wrong (non-integer string, zero, or negative).

```elixir
SafeMath.parse_positive_int("42")     # => {:ok, 42}
SafeMath.parse_positive_int("0")      # => {:error, "must be positive, got 0"}
SafeMath.parse_positive_int("-5")     # => {:error, "must be positive, got -5"}
SafeMath.parse_positive_int("abc")    # => {:error, "not a valid integer: abc"}
SafeMath.parse_positive_int("3.14")   # => {:error, "not a valid integer: 3.14"}
```
