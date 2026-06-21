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

## The task

Implement these functions in the `SafeMath` module:

1. `divide(a, b)` — returns `{:ok, result}` or `{:error, "division by zero"}`.
2. `sqrt(n)` — returns `{:ok, result}` for non-negative `n`, or `{:error, "cannot take sqrt of negative number"}`.
3. `safe_pipeline(a, b, c)` — divides `a` by `b`, then takes the square root of the result, then divides by `c`. Uses `with` to chain the operations. Returns `{:ok, result}` or the first `{:error, reason}` encountered.
4. `parse_positive_int(str)` — parses a string to an integer. Returns `{:ok, n}` if `n > 0`, or `{:error, reason}` with a descriptive reason for any other outcome (non-integer string, zero, negative).
