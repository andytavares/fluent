## What you build

You write a `SafeMath` module whose functions return `{:ok, value}` or `{:error, reason}`, and chain them with `with`. Elixir has two error models: tagged tuples for expected failures and exceptions for unexpected ones. This lesson builds on **Processes**.

## Key concepts

### Tagged tuples signal expected failures

A function returns `{:ok, value}` on success and `{:error, reason}` on failure. The function raises no exception. The caller matches both shapes.

```elixir
def parse_age(str) do
  case Integer.parse(str) do
    {n, ""} when n >= 0 -> {:ok, n}
    _ -> {:error, "invalid age: #{str}"}
  end
end

case parse_age("30") do
  {:ok, age} -> "Age is #{age}"
  {:error, msg} -> "Failed: #{msg}"
end
```

### `with` chains fallible steps

`with` runs each `<-` clause in order. At the first result that does not match its pattern, it stops and goes to `else`. Without `with`, the same code needs deeply nested `case` expressions.

```elixir
with {:ok, raw} <- File.read("c.json"),
     {:ok, cfg} <- Jason.decode(raw),
     {:ok, port} <-
       Map.fetch(cfg, "port") do
  {:ok, port}
else
  {:error, reason} -> {:error, reason}
  :error -> {:error, "missing key"}
end
```

### Exceptions signal unexpected conditions

`raise` throws an exception. `rescue` catches exceptions by type. Use exceptions for programmer errors and unexpected states, not for control flow.

```elixir
raise ArgumentError, "n must be positive"
# Raises RuntimeError
raise "something broke"

try do
  risky_operation()
rescue
  ArgumentError -> "bad argument"
  e in RuntimeError ->
    "runtime: #{Exception.message(e)}"
end
```

### A `!` function raises on failure

By convention, `File.read!/1` raises where `File.read/1` returns `{:error, reason}`. Most standard library modules follow this pattern. Use the `!` form when failure means a bug.

```elixir
# Raises on error
content = File.read!("known_file.txt")
# Match to handle the result
{:ok, content} = File.read("maybe.txt")
```

### Let it crash

Each process runs alone, so a crash does not stop the system. A supervisor restarts the failed process. You write less defensive code for unexpected failures, not more. Go uses `(T, error)` returns and `panic` for the same two roles.

## Watch out

- `<-` stops only on a pattern mismatch. A bare variable matches any value, including `false` and `nil`.
- Match a specific shape such as `{:ok, _}` to make `with` stop on failure.
- Do not mix contracts. If `divide/2` returns `{:error, _}`, it must not also raise `ArithmeticError`.
- `Integer.parse("42abc")` returns `{42, "abc"}`. Check that the rest is `""` to reject trailing text.

## The task

Write four functions in the `SafeMath` module. Each one returns `{:ok, value}` or `{:error, reason}`.

1. `divide(a, b)` returns `{:ok, a / b}`.
2. When `b` is `0`, `divide/2` returns `{:error, "division by zero"}`.
3. `sqrt(n)` returns `{:ok, result}` for `n` of 0 or more.
4. For negative `n`, `sqrt/1` returns `{:error, "cannot take sqrt of negative number"}`.
5. `safe_pipeline(a, b, c)` divides `a` by `b`, takes the square root, then divides by `c`.
6. Chain the three steps in `safe_pipeline/3` with `with`. Return the first error unchanged.
7. `parse_positive_int(str)` returns `{:ok, n}` when all of `str` is an integer greater than 0.
8. Otherwise, it returns `{:error, reason}`. `reason` is a string that says what went wrong.

`/` always returns a float. `parse_positive_int/1` rejects zero, negative numbers, words and decimal strings.

```elixir
SafeMath.divide(10, 2)  # => {:ok, 5.0}
SafeMath.divide(-6, 2)  # => {:ok, -3.0}
SafeMath.divide(10, 0)
# => {:error, "division by zero"}

SafeMath.sqrt(9.0)  # => {:ok, 3.0}
SafeMath.sqrt(0)    # => {:ok, 0.0}
SafeMath.sqrt(-1.0)
# => {:error,
#  "cannot take sqrt of negative number"}

# 100 / 4 = 25, sqrt(25) = 5, 5 / 2 = 2.5
SafeMath.safe_pipeline(100.0, 4.0, 2.0)
# => {:ok, 2.5}
SafeMath.safe_pipeline(100.0, 0, 2.0)
# => {:error, "division by zero"}
SafeMath.safe_pipeline(100.0, 4.0, 0)
# => {:error, "division by zero"}
SafeMath.safe_pipeline(-100.0, 4.0, 2.0)
# => {:error,
#  "cannot take sqrt of negative number"}

SafeMath.parse_positive_int("42")
# => {:ok, 42}
SafeMath.parse_positive_int("1")
# => {:ok, 1}
SafeMath.parse_positive_int("0")
# => {:error, reason}
SafeMath.parse_positive_int("-5")
# => {:error, reason}
SafeMath.parse_positive_int("abc")
# => {:error, reason}
SafeMath.parse_positive_int("3.14")
# => {:error, reason}
```
