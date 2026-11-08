## What you build

You write a `Matcher` module with four functions that take lists and tuples apart with patterns, not library helpers. Pattern matching is the main control flow in Elixir. This lesson builds on **Modules & Functions**.

## Key concepts

### `=` is a match, not an assignment

`=` checks that the right side has the shape of the left side. It binds each unbound variable on the left. If the shapes differ, Elixir raises `MatchError` at runtime.

```elixir
{status, value} = {:ok, 42}
# status => :ok, value => 42

# Raises MatchError:
{:ok, x} = {:error, "oops"}
```

### A match checks the shape too

In Python or JavaScript, destructuring only unpacks. In Elixir, `{:ok, x} = val` also asserts the shape of `val`, so a wrong shape crashes at once.

### `[head | tail]` splits a list

The head is the first element. The tail is the list of the remaining elements. A name that starts with `_` marks a value you ignore.

```elixir
[head | tail] = [1, 2, 3]
# head => 1, tail => [2, 3]

[a, b | _rest] = [10, 20, 30, 40]
# a => 10, b => 20
```

### Function clauses dispatch on patterns

Elixir tries the clauses from top to bottom and runs the first one that matches. You do not need a `switch`.

```elixir
defmodule Shape do
  def area({:circle, r}),
    do: :math.pi() * r * r

  def area({:rect, w, h}), do: w * h

  def area({:triangle, b, h}),
    do: 0.5 * b * h
end

Shape.area({:circle, 5})  # => 78.539...
Shape.area({:rect, 3, 4}) # => 12
```

### `^` matches an existing value

The pin operator `^` compares with the current value of a variable. Without `^`, the variable binds to a new value.

```elixir
expected = :ok
# Matches: expected is :ok
{^expected, result} = {:ok, 42}
# Raises MatchError
{^expected, result} = {:error, 0}
```

### `case` matches inside a function

`case` tries each pattern against one value, from top to bottom.

```elixir
case Map.fetch(config, :timeout) do
  {:ok, val} -> val
  :error -> 5000
end
```

## Watch out

- Order matters in `case` and in clauses. A catch-all too early hides every clause below it.
- A bare variable on the left of `=` always binds. Use `^` to compare with its current value.
- A forgotten `^` is the most common pattern-matching bug.
- `[a, b]` matches exactly two elements. Use `[a, b | _]` to match only a prefix.

## The task

Write four functions in the `Matcher` module. Use pattern matching, not library helpers.

1. `first(list)` returns the first element of `list`. Use a head/tail pattern.
2. `first([])` returns `nil`.
3. `second(list)` returns the second element of `list`.
4. `second(list)` returns `nil` when `list` has fewer than two elements.
5. `describe_tuple(tuple)` takes a tagged tuple and returns a string. A tagged tuple has an atom label as its first element.
6. `{:ok, value}` returns `"ok: <value>"`.
7. `{:error, reason}` returns `"error: <reason>"`.
8. Any other tuple returns `"unknown"`.
9. `contains?(list, target)` returns `true` when `target` is in `list`, and `false` otherwise.
10. Write `contains?/2` with recursion on `[head | tail]`. Do not use `Enum.member?` or `in`.

An empty list contains nothing.

```elixir
Matcher.first([1, 2, 3])   # => 1
Matcher.first([:a])        # => :a
Matcher.first([])          # => nil
Matcher.second([1, 2, 3])  # => 2
Matcher.second([1])        # => nil
Matcher.second([])         # => nil

Matcher.describe_tuple({:ok, 42})
# => "ok: 42"
Matcher.describe_tuple({:error, :timeout})
# => "error: timeout"
Matcher.describe_tuple({:other})
# => "unknown"

Matcher.contains?([1, 2, 3], 2) # => true
Matcher.contains?([1, 2, 3], 9) # => false
Matcher.contains?([], 1)        # => false
Matcher.contains?([5, 6, 7], 5) # => true
Matcher.contains?([5, 6, 7], 7) # => true
```
