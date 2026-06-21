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

## The task

Implement these functions in the `Analytics` module:

1. `word_count(text)` — splits `text` on whitespace, returns a map of `%{word => count}`. Case-insensitive.
2. `top_n(map, n)` — takes a `%{key => count}` map, returns a list of `{key, count}` tuples sorted by count descending, limited to the top `n`.
3. `running_total(numbers)` — returns a list where each element is the sum of all elements up to and including that index: `[1, 2, 3]` → `[1, 3, 6]`. Use `Enum.scan/3`.
4. `first_prime_above(n)` — returns the first prime number greater than `n`. Use `Stream.iterate` to generate candidates and stop early. A helper `prime?(n)` is acceptable.
