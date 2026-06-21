# Macros

## What you'll learn

Elixir macros operate at compile time on the AST — they receive code as data and return transformed code. This is how `defmodule`, `def`, `use`, `if`, and `with` are all implemented in Elixir itself. You'll learn how to read and write simple macros and — critically — when not to.

## Key concepts

**Elixir's AST:**

All Elixir code is represented as nested three-element tuples: `{function, metadata, arguments}`.

```elixir
quote do
  1 + 2
end
# => {:+, [context: Elixir, imports: [{1, Kernel}, {2, Kernel}]], [1, 2]}
```

`quote/2` captures code as its AST representation without evaluating it. `unquote/1` escapes back to the caller's environment inside a `quote` block.

**Writing a macro:**

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

`defmacro` is like `def` except the arguments arrive as AST nodes (quoted), and the return value is injected back into the caller's AST at compile time.

**`unquote_splicing`** inserts a list of AST nodes inline:

```elixir
defmacro log(label, values) do
  quote do
    IO.puts("#{unquote(label)}: #{inspect(unquote_splicing([values]))}")
  end
end
```

**Hygiene:**

Elixir macros are hygienic by default — variables introduced inside a macro don't leak into the caller's scope. Use `var!(name)` when you intentionally want to bind in the caller's context.

**When to write a macro:**

Write a macro only when you cannot accomplish the same thing with a function. Functions are always preferred because they:
- compose cleanly
- are inspectable at runtime
- produce better stack traces

Good macro use cases: DSLs (like `use GenServer`), compile-time validation, eliminating boilerplate that genuinely cannot be a function (e.g., injecting module attributes).

Bad macro use case: anything that can be a function. The Elixir community maxim is *write a macro only as a last resort*.

## vs other languages

| | Elixir | Rust | C/C++ | Lisp / Clojure |
|---|---|---|---|---|
| Macro input | AST (structured) | Token trees | Text substitution | S-expressions (structured) |
| Hygiene | Yes (default) | Yes | No | Varies |
| Timing | Compile time | Compile time | Preprocessing | Compile time |
| Debugging | `Macro.to_string` / `IO.inspect` | `cargo expand` | `-E` flag | macroexpand |

The closest analogy is Lisp macros — both operate on the language's own data representation of code. The difference from C preprocessor macros is total: Elixir macros are type-aware, hygienic, and operate on the parsed AST rather than raw text.

## The task

Implement two macros in the `MyMacros` module:

1. `debug(expr)` — a macro that evaluates `expr`, prints `"DEBUG: <source code> => <value>"` to stdout, and returns the value. For example, `debug(1 + 2)` should print `"DEBUG: 1 + 2 => 3"` and return `3`. Use `Macro.to_string/1` to get the source text.

2. `repeat(n, do: block)` — a macro that generates code equivalent to calling `block` `n` times (where `n` is a compile-time integer literal). It should expand to a sequence of `block` expressions — not a loop at runtime.

Also implement a regular function (not a macro):

3. `measure(fun)` — takes a zero-arity anonymous function, calls it, and returns `{result, microseconds}` where `microseconds` is the wall-clock time taken. Use `:timer.tc/1`.
