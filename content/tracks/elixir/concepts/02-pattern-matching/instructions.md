# Pattern Matching

## What you'll learn

Pattern matching is Elixir's primary control flow mechanism. The `=` operator is a match operator, not assignment. You'll use it to destructure tuples and lists, dispatch on function clauses, and constrain matches with the pin operator.

## Key concepts

**The match operator:**

```elixir
{status, value} = {:ok, 42}
# status => :ok, value => 42

# This raises MatchError — the left side must match the right:
{:ok, x} = {:error, "oops"}
```

`=` in Elixir asserts a structural match and binds unbound variables on the left. If the match fails, you get a `MatchError` at runtime.

**Destructuring lists:**

```elixir
[head | tail] = [1, 2, 3]
# head => 1, tail => [2, 3]

[a, b | _rest] = [10, 20, 30, 40]
# a => 10, b => 20, _rest (ignored with _)
```

**Function clause dispatch:**

```elixir
defmodule Shape do
  def area({:circle, r}),          do: :math.pi() * r * r
  def area({:rect, w, h}),         do: w * h
  def area({:triangle, b, h}),     do: 0.5 * b * h
end

Shape.area({:circle, 5})   # => 78.539...
Shape.area({:rect, 3, 4})  # => 12
```

Elixir tries clauses top-to-bottom and picks the first that matches. No `switch` needed.

**The pin operator `^`** prevents rebinding — it asserts the variable's current value:

```elixir
expected = :ok
{^expected, result} = {:ok, 42}   # passes — expected is still :ok
{^expected, result} = {:error, 0} # MatchError
```

Without `^`, `expected` would be rebound to `:error`. Use `^` when you want to match against an existing value, not capture a new one.

**`case` for inline pattern dispatch:**

```elixir
case Map.fetch(config, :timeout) do
  {:ok, val} -> val
  :error     -> 5000
end
```

## vs other languages

| | Elixir | Python | JavaScript | Go |
|---|---|---|---|---|
| Destructuring | `=` match operator | `a, b = tup` (unpack) | `const [a, b] = arr` | multiple return only |
| Exhaustiveness | runtime `MatchError` | `ValueError` | silent `undefined` | compile-time |
| Function dispatch | pattern on args | `isinstance` / manual | manual `if` chains | interface dispatch |

The critical difference from Python/JS destructuring: Elixir's match is **bidirectional**. `{:ok, x} = val` doesn't just unpack — it asserts the shape of `val`. A shape mismatch crashes immediately rather than producing a confusing `undefined`.

## The task

Implement these functions in the `Matcher` module:

1. `first(list)` — returns the first element of a non-empty list using head/tail pattern. Return `nil` for an empty list.
2. `second(list)` — returns the second element, or `nil` if the list has fewer than two elements.
3. `describe_tuple(tuple)` — accepts a tagged tuple and returns a string:
   - `{:ok, val}` → `"ok: #{val}"`
   - `{:error, reason}` → `"error: #{reason}"`
   - anything else → `"unknown"`
4. `contains?(list, target)` — returns true if `target` appears in `list`, using recursive pattern matching (no `Enum.member?`).
