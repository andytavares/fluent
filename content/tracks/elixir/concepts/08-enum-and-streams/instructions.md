# Enum & Streams

## What you'll learn

`Enum` is Elixir's Swiss Army knife for eager collection operations. `Stream` provides the same interface but defers work until the result is consumed — essential when processing large files, infinite sequences, or expensive pipelines where you only need the first N results.

## Key concepts

**`Enum` — eager, immediate:**

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)         # => [2, 4, 6]
Enum.filter([1, 2, 3, 4], &(rem(&1, 2) == 0))  # => [2, 4]
Enum.reduce([1, 2, 3], 0, &+/2)                # => 6
Enum.flat_map([[1, 2], [3, 4]], & &1)           # => [1, 2, 3, 4]
Enum.group_by(["foo", "bar", "baz"], &String.at(&1, 0))
# => %{"f" => ["foo"], "b" => ["bar", "baz"]}
Enum.zip([1, 2, 3], [:a, :b, :c])  # => [{1, :a}, {2, :b}, {3, :c}]
Enum.sort_by(users, & &1.age)
Enum.chunk_every([1,2,3,4,5], 2)   # => [[1,2],[3,4],[5]]
```

Every `Enum` function materializes the entire result into memory before the next step runs.

**`Stream` — lazy, deferred:**

```elixir
1..10_000_000
|> Stream.map(fn x -> x * x end)
|> Stream.filter(fn x -> rem(x, 2) == 0 end)
|> Enum.take(5)
# => [4, 16, 36, 64, 100]  — only processes what's needed
```

`Stream.map` and `Stream.filter` return a lazy `Stream` struct. Nothing runs until an `Enum` function forces evaluation. This is the same model as Haskell lazy lists, Rust iterators, or Java Streams.

**Infinite streams:**

```elixir
Stream.iterate(0, &(&1 + 1))       # 0, 1, 2, 3, ...
Stream.cycle([:a, :b, :c])         # :a, :b, :c, :a, :b, :c, ...
Stream.unfold({0, 1}, fn {a, b} -> {a, {b, a + b}} end)  # Fibonacci
```

**`Stream.resource/3`** is the escape hatch for external resources (files, database cursors, HTTP chunked responses) — it manages open/read/close without loading everything at once.

**When to use which:**

- Small in-memory collections: `Enum` — clearer and slightly less overhead.
- Large collections, files, or pipelines where you only need the first N: `Stream`.
- You need multiple passes over the same data: `Enum` (streams are single-pass).

## vs other languages

| | Elixir | Python | Java | Rust |
|---|---|---|---|---|
| Eager ops | `Enum` | list comprehension / `map` | `Collection` methods | `.collect()` after iter |
| Lazy ops | `Stream` | generators | `Stream` API | iterator chains |
| Infinite sequences | `Stream.iterate` | `itertools.count` | `Stream.generate` | `.repeat()` / custom |
| Force evaluation | `Enum.*` at end | `list(gen)` | `.collect()` | `.collect()` |

The API symmetry between `Enum` and `Stream` is deliberate — you can swap one for the other with minimal refactoring. Just replace `Enum.map` with `Stream.map` and add `Enum.to_list` (or `Enum.take`) at the end.

## Watch out

- `Stream.iterate/2` is infinite by construction — feeding it straight into an `Enum` function that materializes everything (like `Enum.to_list/1` or `Enum.map/2`) hangs forever. Always pair it with something that stops early: `Enum.find/2`, `Enum.take/2`, or `Stream.take_while/2`.
- `Enum.sort_by(map, fn {_k, v} -> v end, :desc)` sorts a *map* by iterating its `{key, value}` pairs — the third argument controls sort direction; without `:desc` you get ascending order, which silently produces the wrong "top N".
- A `Stream` pipeline is single-pass and re-evaluates its source from scratch every time you force it — reuse the underlying `Enum`/list, not a partially-consumed `Stream`, if you need the same data twice.

## The task

Implement these functions in the `Analytics` module.

**`word_count(text)`** — splits `text` on whitespace and returns a map of `%{word => count}`, case-insensitive.

```elixir
Analytics.word_count("the cat sat on the mat")
# => %{"the" => 2, "cat" => 1, "sat" => 1, "on" => 1, "mat" => 1}

Analytics.word_count("Hello hello HELLO")  # => %{"hello" => 3}
Analytics.word_count("")                   # => %{}
```

**`top_n(map, n)`** — takes a `%{key => count}` map and returns a list of `{key, count}` tuples sorted by count descending, limited to the top `n` entries.

```elixir
Analytics.top_n(%{"a" => 3, "b" => 1, "c" => 2}, 2)
# => [{"a", 3}, {"c", 2}]

Analytics.top_n(%{"x" => 1}, 10)  # => [{"x", 1}]  — n larger than the map just returns everything
```

**`running_total(numbers)`** — returns a list where each element is the sum of all elements up to and including that index. Use `Enum.scan/3`.

```elixir
Analytics.running_total([1, 2, 3, 4])  # => [1, 3, 6, 10]
Analytics.running_total([5])           # => [5]
Analytics.running_total([])            # => []
Analytics.running_total([1, -1, 2])    # => [1, 0, 2]
```

**`first_prime_above(n)`** — returns the first prime number strictly greater than `n`. Use `Stream.iterate/2` to generate ascending candidates lazily and stop at the first one that's prime — a helper `prime?(n)` (private, not part of the public API) is expected.

```elixir
Analytics.first_prime_above(10)   # => 11
Analytics.first_prime_above(2)    # => 3
Analytics.first_prime_above(1)    # => 2
Analytics.first_prime_above(100)  # => 101
```
