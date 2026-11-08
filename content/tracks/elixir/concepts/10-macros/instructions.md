## What you build

You write two macros, `debug/1` and `repeat/2`, and one function, `measure/1`, in a `MyMacros` module. A macro runs at compile time: it takes code as data and returns new code. This lesson builds on **Protocols**.

## Key concepts

### Elixir builds itself with macros

`defmodule`, `def`, `use`, `if` and `with` are macros written in Elixir. You can read and write simple macros, and you must know when not to.

### Code is a tree of three-element tuples

Elixir represents code as an abstract syntax tree (AST). Each node is a tuple: `{function, metadata, arguments}`.

```elixir
quote do
  1 + 2
end
# => {:+, [context: Elixir,
#     imports: [{1, Kernel}, {2, Kernel}]],
#     [1, 2]}
```

### `quote` captures code, `unquote` inserts it

`quote/2` returns the AST of its block and does not run it. Inside a `quote`, `unquote/1` inserts a value from the macro into the AST.

### `defmacro` defines a macro

A macro is like a function, but its arguments arrive as AST. At compile time, Elixir puts the AST that the macro returns in place of the call.

```elixir
defmodule MyMacros do
  defmacro unless(condition, do: body) do
    quote do
      if !unquote(condition) do
        unquote(body)
      end
    end
  end
end

import MyMacros
unless 1 == 2 do
  IO.puts("this runs")
end
```

### `unquote_splicing` inserts a list

`unquote_splicing/1` inserts each element of a list of AST nodes in place.

```elixir
defmacro log(label, values) do
  quote do
    value =
      inspect(unquote_splicing([values]))

    IO.puts("#{unquote(label)}: #{value}")
  end
end
```

### Macros are hygienic

A variable that a macro creates does not leak into the caller's scope. Use `var!(name)` when you want to bind a variable in the caller's scope.

### Macros work on structure, not text

Like Lisp macros, Elixir macros work on the language's own data form of code. A C preprocessor macro substitutes raw text and has no hygiene.

### Prefer a function

Write a macro only when a function cannot do the job. Functions compose cleanly, you can inspect them at runtime, and they give better stack traces.

Good uses for a macro are DSLs such as `use GenServer`, checks at compile time, and boilerplate that a function cannot remove. An example is code that adds module attributes. The Elixir community rule is: write a macro only as a last resort.

## Watch out

- A file cannot use a module's macros in the same compile unit as the `defmodule` that defines them.
- Elixir must compile the module first. Put the calling code in a later pass, such as `Code.eval_string/1`.
- `unquote(expr)` inserts the caller's code unevaluated. Two `unquote(expr)` calls run that code twice.
- To use a value twice, bind `unquote(expr)` to a variable inside `quote` once. Then use the variable.
- `n` in `repeat(n, do: block)` must be an integer literal. The macro uses `n` at expansion time, not at runtime.

## The task

Write two macros and one function in the `MyMacros` module.

1. `debug(expr)` is a macro. It evaluates `expr` and returns its value.
2. `debug/1` also prints `DEBUG: <source> => <value>` to stdout.
3. To get `<source>`, call `Macro.to_string/1` on the unevaluated `expr` at expansion time.
4. `repeat(n, do: block)` is a macro. It expands to `n` copies of `block` in sequence.
5. `n` is an integer literal. The expansion is a fixed list of statements, not a runtime loop.
6. `repeat(0, do: block)` expands to no statements, so `block` never runs.
7. `measure(fun)` is a function, not a macro. It calls `fun` and returns `{result, microseconds}`.
8. `fun` takes no arguments. `microseconds` is the wall-clock time of the call. Use `:timer.tc/1`.

```elixir
debug(3 + 4)
# prints: DEBUG: 3 + 4 => 7
# returns: 7
debug(6 * 7)
# returns: 42
debug("foo" <> "bar")
# prints: DEBUG: "foo" <> "bar" => "foobar"
# returns: "foobar"

# Each call starts from an Agent at 0:
inc = &(&1 + 1)
repeat(1, do: Agent.update(agent, inc))
# Agent holds 1
repeat(3, do: Agent.update(agent, inc))
# Agent holds 3
repeat(0, do: Agent.update(agent, inc))
# Agent holds 0

MyMacros.measure(fn -> 99 end)
# => {99, us}, us is an integer >= 0
MyMacros.measure(fn -> :ok end)
# => {:ok, us}, us is an integer >= 0
sleep = fn -> :timer.sleep(1) end
{_, us} = MyMacros.measure(sleep)
# us >= 1000 for a 1 ms sleep
```
