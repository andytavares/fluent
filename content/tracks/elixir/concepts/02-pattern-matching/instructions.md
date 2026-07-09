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

## Watch out

- `case`/function clauses try patterns **top to bottom** and stop at the first match — order matters. A catch-all clause (`_` or an unguarded variable) placed too early shadows every clause below it.
- A bare variable on the left of `=` or in a function head always **binds** (never compares) unless pinned with `^`. Forgetting the pin when you meant to compare against an existing value is the single most common pattern-matching bug.
- Matching a list as `[a, b]` requires *exactly* two elements — it raises `MatchError` on a list with one or three elements. Use `[a, b | _]` when you only care about a prefix.

## The task

Implement these functions in the `Matcher` module, all built on pattern matching rather than library helpers.

**`first(list)`** — returns the first element of a list using a head/tail pattern, or `nil` for an empty list.

```elixir
Matcher.first([1, 2, 3])  # => 1
Matcher.first([:a])       # => :a
Matcher.first([])         # => nil
```

**`second(list)`** — returns the second element, or `nil` if the list has fewer than two elements.

```elixir
Matcher.second([1, 2, 3])  # => 2
Matcher.second([1])        # => nil
Matcher.second([])         # => nil
```

**`describe_tuple(tuple)`** — accepts a tagged tuple (a tuple whose first element is an atom acting as a label, e.g. `{:ok, 42}`) and returns a description string:

```elixir
Matcher.describe_tuple({:ok, 42})            # => "ok: 42"
Matcher.describe_tuple({:error, :timeout})   # => "error: timeout"
Matcher.describe_tuple({:other})             # => "unknown"  — anything else falls through
```

**`contains?(list, target)`** — returns `true` if `target` appears anywhere in `list`, implemented via recursive pattern matching on `[head | tail]` (no `Enum.member?` or `in`).

```elixir
Matcher.contains?([1, 2, 3], 2)   # => true
Matcher.contains?([1, 2, 3], 9)   # => false
Matcher.contains?([], 1)          # => false
Matcher.contains?([5, 6, 7], 5)   # => true   — matches at the head
Matcher.contains?([5, 6, 7], 7)   # => true   — matches at the tail end
```
