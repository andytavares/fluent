# Modules & Functions

## What you'll learn

How Elixir organizes code into modules, how to define public and private functions, how default arguments work, how to add runtime guards to function heads, and how the pipe operator `|>` replaces deeply nested calls.

## Key concepts

**Defining a module and functions:**

```elixir
defmodule Greeter do
  def hello(name), do: "Hello, #{name}!"

  defp shout(str), do: String.upcase(str)   # private — not callable outside this module
end
```

`def` is public; `defp` is private. Both compile down to regular functions — there are no access modifiers at the call site beyond the module boundary.

**Default arguments** use `\\` syntax:

```elixir
def greet(name, greeting \\ "Hello") do
  "#{greeting}, #{name}!"
end
```

When a function has multiple clauses, defaults are declared in a bare function head:

```elixir
def greet(name, greeting \\ "Hello")
def greet(name, greeting), do: "#{greeting}, #{name}!"
```

**Guard clauses** restrict which clause matches:

```elixir
def abs_val(n) when n < 0, do: -n
def abs_val(n), do: n
```

Guards are limited to a safe whitelist of expressions (comparisons, type checks, arithmetic) — arbitrary function calls are not allowed inside `when`.

**The pipe operator `|>`** threads the result of each expression as the first argument of the next:

```elixir
"  hello world  "
|> String.trim()
|> String.split()
|> Enum.map(&String.capitalize/1)
|> Enum.join(" ")
# => "Hello World"
```

This is the Elixir idiom for data transformation pipelines. You will see it everywhere.

**Capturing function references** with `&`:

```elixir
&String.upcase/1        # named function reference, arity 1
&(&1 * 2)               # anonymous function shorthand
fn x -> x * 2 end      # explicit anonymous function
```

## vs other languages

| | Elixir | Python / Ruby | Go / Java |
|---|---|---|---|
| Module system | `defmodule` — compile-time namespace | class or module file | package / class |
| Private | `defp` | `_` convention / `private` | unexported / `private` |
| Overloading | Multiple clauses with guards | Not native | Not native |
| Pipelines | `|>` built-in | method chaining on objects | explicit variable threading |

Coming from JavaScript or Python: there is no `this` or `self`. Every function receives all its data as arguments. Modules are namespaces, not objects.

Coming from Java/C#: there are no classes. If you want polymorphism, use protocols (concept 09) or behaviours.

## Watch out

- Clause order matters. `def factorial(0), do: 1` must come before the general recursive clause, or the general clause (which doesn't check for `0`) would match first and recurse forever.
- Guards can only use a safe whitelist (comparisons, `is_*` type checks, basic arithmetic and boolean logic). Calling a regular function — even your own — inside `when` is a compile error.
- `\\ ` default values are evaluated **per-call**, not once at compile time — safe for expressions like `\\ DateTime.utc_now()`, unlike Python's infamous mutable-default-argument trap.

## The task

Implement four functions in the `MathUtils` module.

**`square(n)`** — returns `n * n`.

```elixir
MathUtils.square(4)   # => 16
MathUtils.square(0)   # => 0
MathUtils.square(-3)  # => 9
```

**`cube(n)`** — returns `n * n * n`.

```elixir
MathUtils.cube(3)    # => 27
MathUtils.cube(0)    # => 0
MathUtils.cube(-2)   # => -8
```

**`sum_of_squares(a, b)`** — returns the sum of the squares of `a` and `b`. Implement it as a pipeline using `|>` (e.g. build `[a, b]`, map `square/1` over it, then sum).

```elixir
MathUtils.sum_of_squares(3, 4)  # => 25   (9 + 16)
MathUtils.sum_of_squares(0, 0)  # => 0
```

**`factorial(n)`** — returns `n!` (the product `1 * 2 * ... * n`) for non-negative integers. Implement `factorial(0)` as its own clause returning `1`, and use a guard clause (`when n < 0`) to `raise ArgumentError` for negative input — do not use `if`/`cond` for the negative check.

```elixir
MathUtils.factorial(0)   # => 1
MathUtils.factorial(1)   # => 1
MathUtils.factorial(5)   # => 120
MathUtils.factorial(10)  # => 3_628_800
MathUtils.factorial(-1)  # raises ArgumentError
```
