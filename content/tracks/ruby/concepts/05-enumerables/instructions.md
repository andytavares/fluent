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

## The task

```ruby
def top_n_words(text, n)
  # Split text on whitespace, count occurrences of each word,
  # return the n most frequent words as an Array of strings,
  # sorted by frequency descending (ties broken alphabetically ascending).
end

def running_total(nums)
  # Return an Array where each element is the cumulative sum up to that index.
  # E.g. [1, 2, 3] => [1, 3, 6]
end

def first_n_multiples(base, n)
  # Using a lazy enumerator over an infinite range,
  # return the first n positive multiples of base.
  # E.g. first_n_multiples(3, 4) => [3, 6, 9, 12]
end
```
