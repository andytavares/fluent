# Enumerables

## What you'll learn

The `Enumerable` module — Ruby's single richest source of collection power — and how to build your own enumerable class. Plus lazy enumerators for working with large or infinite sequences.

## Key concepts

### The Enumerable contract

Any class that defines `each` and includes `Enumerable` gets ~60 methods for free: `map`, `select`, `sort_by`, `group_by`, `min_by`, `max_by`, `count`, `any?`, `all?`, `none?`, `flat_map`, `zip`, `tally`, and more.

```ruby
class NumberRange
  include Enumerable

  def initialize(from, to)
    @from = from
    @to   = to
  end

  def each
    n = @from
    while n <= @to
      yield n
      n += 1
    end
  end
end

r = NumberRange.new(1, 5)
r.map { |n| n ** 2 }   # => [1, 4, 9, 16, 25]
r.select(&:odd?)        # => [1, 3, 5]
r.min                   # => 1
r.sort_by { |n| -n }   # => [5, 4, 3, 2, 1]
```

### Sorting

`sort` uses `<=>` (the spaceship operator). `sort_by` is a Schwartzian transform — it computes the sort key once per element, which is more efficient than `sort` with a comparator block when the key is expensive.

```ruby
words = ["banana", "fig", "apple", "kiwi"]
words.sort                          # => ["apple", "banana", "fig", "kiwi"]
words.sort_by(&:length)             # => ["fig", "kiwi", "apple", "banana"]
words.sort_by { |w| [-w.length, w] }  # longest first, alphabetical tie-break
```

### Grouping and tallying

```ruby
people = [
  { name: "Alice", dept: "eng" },
  { name: "Bob",   dept: "eng" },
  { name: "Carol", dept: "hr"  }
]

people.group_by { |p| p[:dept] }
# => { "eng" => [{Alice...}, {Bob...}], "hr" => [{Carol...}] }

["a", "b", "a", "c", "b", "a"].tally
# => {"a"=>3, "b"=>2, "c"=>1}
```

### Aggregate predicates

```ruby
[2, 4, 6].all?(&:even?)    # => true
[1, 2, 3].any?(&:even?)    # => true
[1, 3, 5].none?(&:even?)   # => true
[1, 2, 3].count(&:odd?)    # => 2
[3, 1, 4, 1, 5].min_by { |n| n }  # => 1
[3, 1, 4, 1, 5].max_by { |n| n }  # => 5
```

### Lazy enumerators

`lazy` defers computation until you explicitly force a result. Use it when the collection is large, when it comes from an external source, or when you're chaining operations that could short-circuit early.

```ruby
# Without lazy, this builds intermediate arrays:
(1..Float::INFINITY).select { |n| n.odd? }.first(5)
# => infinite loop — select tries to consume the entire infinite range

# With lazy:
(1..Float::INFINITY).lazy.select { |n| n.odd? }.first(5)
# => [1, 3, 5, 7, 9]
```

Force evaluation with `to_a`, `first(n)`, or `force`.

## vs other languages

| | Ruby | Python | Java | Go |
|---|---|---|---|---|
| Enumerable protocol | Define `each` + `include Enumerable` | Define `__iter__` | Implement `Iterable<T>` | Implement a range function / channel pattern |
| Lazy sequences | `.lazy` | Generators (`yield`) | `Stream.of(...).lazy` | Channels or manual iteration |
| Sort key extraction | `sort_by { key }` | `sorted(key=...)` | `Comparator.comparing(...)` | `slices.SortFunc` |
| Grouping | `group_by` | `itertools.groupby` | `Collectors.groupingBy` | manual map building |

The `<=>` (spaceship) operator is Ruby-specific. It returns `-1`, `0`, or `1` and is what `sort` calls. Implement it on your own class with `include Comparable` to get `<`, `>`, `<=`, `>=`, `between?`, and `clamp` for free.

## Watch out

- `sort_by { |x| key }` is **not guaranteed stable** in general, but calling it twice on the same input with a deterministic key gives deterministic output — when you need a tie-break, put it explicitly in the key (`[-freq, word]`) rather than relying on original order.
- `(1..Float::INFINITY).select { }` with no `.lazy` will hang forever — `select`/`map`/`sort_by` on a non-lazy enumerator always try to consume the whole sequence before returning anything. `.lazy` must come **before** the chain of operations, and you still need `.first(n)` or `.force` at the end to pull results out.
- `Hash.new(0)` is the right default for counting occurrences (`h[word] += 1` works even the first time), but remember it's still `nil` for `.fetch` — `each_with_object`/`Hash.new(0)` only affects `[]` reads.
- `min_by`/`max_by` return `nil` on an empty collection rather than raising — always check for that if the input might be empty.

## The task

Implement three functions built on `Enumerable` methods (`each_with_object`, `sort_by`, `lazy`).

**`top_n_words(text, n)`** — splits `text` on whitespace, counts occurrences of each word, and returns the `n` most frequent words as an `Array` of strings. Ties are broken alphabetically (ascending). If `text` has fewer than `n` distinct words, returns all of them.

```ruby
top_n_words("the cat sat on the mat the cat", 2)  # => ["the", "cat"]
top_n_words("the cat sat on the mat the cat", 1)  # => ["the"]
top_n_words("a b a b c", 2)                       # => ["a", "b"]  — tie broken alphabetically
top_n_words("", 3)                                # => []
top_n_words("hello", 5)                           # => ["hello"]  — fewer words than n
```

**`running_total(nums)`** — returns an `Array` the same length as `nums`, where each element is the cumulative sum of all elements up to and including that index.

```ruby
running_total([1, 2, 3, 4, 5])  # => [1, 3, 6, 10, 15]
running_total([5])              # => [5]
running_total([])               # => []
running_total([1, -1, 3])       # => [1, 0, 3]
```

**`first_n_multiples(base, n)`** — using a **lazy enumerator** over an infinite range, returns the first `n` positive multiples of `base` as an `Array`.

```ruby
first_n_multiples(3, 5)  # => [3, 6, 9, 12, 15]
first_n_multiples(7, 3)  # => [7, 14, 21]
first_n_multiples(10, 1) # => [10]
first_n_multiples(4, 0)  # => []
```
