## What you build

You write a `MathUtils` module with four functions: `square/1`, `cube/1`, `sum_of_squares/2` and `factorial/1`. You use public functions, multiple clauses, a guard and the pipe operator `|>`.

## Key concepts

### A module groups functions

`defmodule` defines a module. `def` defines a public function. `defp` defines a private function that only code in the same module can call.

```elixir
defmodule Greeter do
  def hello(name), do: "Hello, #{name}!"

  # Private: not callable outside Greeter
  defp shout(str), do: String.upcase(str)
end
```

### Modules are namespaces, not objects

Elixir has no classes and no `this` or `self`. Every function gets all its data as arguments. For polymorphism, Elixir uses protocols or behaviours.

### `\\` sets a default argument

Elixir evaluates a default value on each call, not once at compile time. A default such as `\\ DateTime.utc_now()` is safe, unlike Python's mutable default arguments.

```elixir
def greet(name, greeting \\ "Hello") do
  "#{greeting}, #{name}!"
end
```

When a function has more than one clause, declare the defaults in a bare function head:

```elixir
def greet(name, greeting \\ "Hello")

def greet(name, greeting),
  do: "#{greeting}, #{name}!"
```

### A function can have many clauses

Elixir tries the clauses from top to bottom and runs the first one that matches. Many clauses replace overloading in other languages.

```elixir
def factorial(0), do: 1
def factorial(n), do: n * factorial(n - 1)
```

### A guard restricts a clause

A `when` guard adds a condition to a clause. Guards accept only a fixed set of expressions: comparisons, `is_*` type checks, arithmetic and boolean logic.

```elixir
def abs_val(n) when n < 0, do: -n
def abs_val(n), do: n
```

### `|>` passes a result to the next call

The pipe operator puts the value on its left in as the first argument of the call on its right. Elixir code uses it for most data transformations.

```elixir
"  hello world  "
|> String.trim()
|> String.split()
|> Enum.map(&String.capitalize/1)
|> Enum.join(" ")
# => "Hello World"
```

### `&` captures a function

`&` makes a function value from a named function or from a short expression.

```elixir
# Named function, arity 1
&String.upcase/1
# Anonymous shorthand
&(&1 * 2)
# Full anonymous function
fn x -> x * 2 end
```

## Watch out

- Clause order matters. Put `factorial(0)` before the general clause, or the general clause matches 0 and recurses forever.
- A regular function call inside `when` is a compile error. This is true for your own functions too.
- Elixir evaluates a `\\` default on each call. It does not share one value between calls.

## The task

Write four functions in the `MathUtils` module.

1. `square(n)` returns `n * n`.
2. `cube(n)` returns `n * n * n`.
3. `sum_of_squares(a, b)` returns `a * a + b * b`. Write it as a pipeline with `|>`. Build `[a, b]`, map `square/1` over it, then sum.
4. `factorial(n)` returns `n!`, the product `1 * 2 * ... * n`.
5. `factorial(0)` is its own clause and returns 1.
6. `factorial(n)` with `n < 0` raises `ArgumentError`. Use a guard clause, not `if` or `cond`.

Zero and negative numbers work for `square/1` and `cube/1`.

```elixir
MathUtils.square(5)            # => 25
MathUtils.square(0)            # => 0
MathUtils.square(-3)           # => 9
MathUtils.cube(3)              # => 27
MathUtils.cube(0)              # => 0
MathUtils.cube(-2)             # => -8
MathUtils.sum_of_squares(3, 4) # => 25
MathUtils.sum_of_squares(0, 0) # => 0
MathUtils.factorial(0)         # => 1
MathUtils.factorial(1)         # => 1
MathUtils.factorial(5)         # => 120
MathUtils.factorial(10)
# => 3_628_800
MathUtils.factorial(-1)
# raises ArgumentError
```
