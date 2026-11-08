## What you build

You write an `Analytics` module with four functions: three use `Enum` and one uses a lazy `Stream`. `Enum` runs each step at once; `Stream` waits until you need a result. This lesson builds on **GenServer**.

## Key concepts

### `Enum` is eager

Each `Enum` function builds its whole result in memory before the next step runs.

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)
# => [2, 4, 6]
is_even = &(rem(&1, 2) == 0)
Enum.filter([1, 2, 3, 4], is_even)
# => [2, 4]
Enum.reduce([1, 2, 3], 0, &+/2) # => 6
Enum.flat_map([[1, 2], [3, 4]], & &1)
# => [1, 2, 3, 4]
Enum.group_by(["foo", "bar", "baz"],
  &String.at(&1, 0))
# => %{"f" => ["foo"],
#      "b" => ["bar", "baz"]}
Enum.zip([1, 2, 3], [:a, :b, :c])
# => [{1, :a}, {2, :b}, {3, :c}]
Enum.sort_by(users, & &1.age)
Enum.chunk_every([1, 2, 3, 4, 5], 2)
# => [[1, 2], [3, 4], [5]]
```

### `Stream` is lazy

`Stream.map/2` and `Stream.filter/2` return a lazy `Stream` struct. Nothing runs until an `Enum` function asks for values. Rust iterators and Java Streams use the same model.

```elixir
1..10_000_000
|> Stream.map(fn x -> x * x end)
|> Stream.filter(&(rem(&1, 2) == 0))
|> Enum.take(5)
# => [4, 16, 36, 64, 100]
# Only the first 10 squares run.
```

### A stream can be infinite

A lazy stream computes only the elements you take, so it can describe an endless sequence.

```elixir
# 0, 1, 2, 3, ...
Stream.iterate(0, &(&1 + 1))
# :a, :b, :c, :a, :b, :c, ...
Stream.cycle([:a, :b, :c])
# Fibonacci: 0, 1, 1, 2, 3, ...
Stream.unfold({0, 1}, fn {a, b} ->
  {a, {b, a + b}}
end)
```

### `Stream.resource/3` wraps external data

`Stream.resource/3` opens, reads and closes a resource such as a file, a database cursor or a chunked HTTP response. It does not load all the data at once.

### Choose `Enum` or `Stream` by size

- Use `Enum` for small collections in memory. It is clearer and has less overhead.
- Use `Stream` for large collections, files, or when you need only the first N results.
- Use `Enum` when you need more than one pass over the data.

### `Enum` and `Stream` share one API

To make a pipeline lazy, replace `Enum.map` with `Stream.map`. Then end the pipeline with `Enum.to_list/1` or `Enum.take/2`.

## Watch out

- `Stream.iterate/2` never ends. `Enum.to_list/1` or `Enum.map/2` on it hangs forever.
- Stop an infinite stream early with `Enum.find/2`, `Enum.take/2` or `Stream.take_while/2`.
- `Enum.sort_by/3` sorts ascending by default. Without `:desc`, your "top N" is the bottom N.
- A map sorts as a list of `{key, value}` pairs: `Enum.sort_by(map, fn {_k, v} -> v end, :desc)`.
- A `Stream` runs its source again each time you use it. To use data twice, keep the list, not the stream.

## The task

Write four functions in the `Analytics` module.

1. `word_count(text)` splits `text` on whitespace and returns a map of `%{word => count}`.
2. `word_count/1` ignores case. It uses the lowercase form of each word as the key.
3. `top_n(map, n)` takes a `%{key => count}` map and returns `{key, count}` tuples.
4. `top_n/2` sorts the tuples by count, largest first, and keeps the first `n`.
5. `running_total(numbers)` returns a list of running sums. Element `i` is the sum of elements 0 to `i`.
6. Write `running_total/1` with `Enum.scan`.
7. `first_prime_above(n)` returns the first prime number greater than `n`.
8. In `first_prime_above/1`, use `Stream.iterate/2` for the candidates. Stop at the first prime.

A prime is an integer greater than 1 with no divisors other than 1 and itself. Write a private `prime?/1` helper.

An empty string gives `%{}`. When `n` is larger than the map, `top_n/2` returns all entries. An empty list gives `[]`.

```elixir
Analytics.word_count(
  "the cat sat on the mat")
# => %{"the" => 2, "cat" => 1, "sat" => 1,
#      "on" => 1, "mat" => 1}
Analytics.word_count("Hello hello HELLO")
# => %{"hello" => 3}
Analytics.word_count("elixir")
# => %{"elixir" => 1}
Analytics.word_count("")  # => %{}

counts = %{"a" => 3, "b" => 1, "c" => 2}
Analytics.top_n(counts, 2)
# => [{"a", 3}, {"c", 2}]
Analytics.top_n(%{"x" => 1}, 10)
# => [{"x", 1}]

Analytics.running_total([1, 2, 3, 4])
# => [1, 3, 6, 10]
Analytics.running_total([5])  # => [5]
Analytics.running_total([])   # => []
Analytics.running_total([1, -1, 2])
# => [1, 0, 2]

Analytics.first_prime_above(10)   # => 11
Analytics.first_prime_above(2)    # => 3
Analytics.first_prime_above(1)    # => 2
Analytics.first_prime_above(100)  # => 101
```
