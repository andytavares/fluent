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

## Watch out

- A module cannot `import` (or `require` and call qualified) its **own** macros in the same top-level compile unit as the `defmodule` that defines them — Elixir needs the module fully compiled first. This is why demo/usage code that calls `debug`/`repeat` right after defining `MyMacros` in the same file must live in a separate compilation pass (for example wrapped in `Code.eval_string/1`) — a real, easy-to-hit footgun, not a hypothetical one.
- `unquote(expr)` splices the caller's AST into your `quote` block *unevaluated* — if you evaluate `expr` twice inside the macro body (e.g. once to log it, once to return it) the caller's code runs twice, which is wrong for anything with a side effect. Bind it to a variable inside `quote` once, then reuse the variable.
- `n` in `repeat(n, do: block)` must be a literal integer known at compile time — `List.duplicate/2` runs while *expanding* the macro, not at runtime, so a runtime-only value for `n` (e.g. a variable holding user input) won't work here.

## The task

Implement two macros and one regular function in the `MyMacros` module.

**`debug(expr)`** — a macro that evaluates `expr`, prints `"DEBUG: <source code> => <value>"` to stdout, and returns the value. Use `Macro.to_string/1` (called on the macro's *unevaluated* AST argument, at expansion time) to render the source text.

```elixir
debug(1 + 2)
# prints: DEBUG: 1 + 2 => 3
# returns: 3

debug("foo" <> "bar")
# prints: DEBUG: "foo" <> "bar" => "foobar"
# returns: "foobar"
```

**`repeat(n, do: block)`** — a macro that expands to code equivalent to calling `block` `n` times in sequence — `n` is a compile-time integer literal, and the expansion is a fixed sequence of statements, not a runtime loop.

```elixir
repeat(3, do: IO.puts("hello"))
# prints "hello" three times — equivalent to writing IO.puts("hello") three times in a row

repeat(0, do: IO.puts("hello"))
# prints nothing — expands to zero statements
```

**`measure(fun)`** — a regular function (not a macro) that takes a zero-arity anonymous function, calls it, and returns `{result, microseconds}` where `microseconds` is the wall-clock time the call took. Use `:timer.tc/1`.

```elixir
{result, us} = measure(fn -> 99 end)
result  # => 99
is_integer(us) and us >= 0  # => true

{_, us} = measure(fn -> :timer.sleep(1) end)
us >= 1000  # => true — at least 1000 microseconds for a 1ms sleep
```
