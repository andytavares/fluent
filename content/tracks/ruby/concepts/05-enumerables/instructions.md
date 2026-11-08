## What you build

You write three functions with `Enumerable` methods: a word frequency count, a running total and a lazy list of multiples. This lesson builds on **Classes & Modules**.

## Key concepts

### `each` plus `Enumerable` gives you about 60 methods

A class that defines `each` and includes `Enumerable` gets `map`, `select`, `sort_by`, `group_by`, `min_by`, `count`, `tally` and more. Python uses `__iter__` for the same job.

```ruby
class NumberRange
  include Enumerable

  def initialize(from, to)
    @from = from
    @to = to
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
r.map { |n| n ** 2 }
# => [1, 4, 9, 16, 25]
r.select(&:odd?)      # => [1, 3, 5]
r.min                 # => 1
r.sort_by { |n| -n }  # => [5, 4, 3, 2, 1]
```

### `sort` uses `<=>`, `sort_by` uses a key

The spaceship operator `<=>` returns `-1`, `0` or `1`, and `sort` calls it. `sort_by` computes the key once per element. It is faster than `sort` with a block when the key is expensive.

```ruby
words = ["banana", "fig", "apple", "kiwi"]
words.sort
# => ["apple", "banana", "fig", "kiwi"]
words.sort_by(&:length)
# => ["fig", "kiwi", "apple", "banana"]

# Longest first, then alphabetical:
words.sort_by { |w| [-w.length, w] }
```

### `Comparable` builds on `<=>`

Define `<=>` and include `Comparable` to get `<`, `>`, `<=`, `>=`, `between?` and `clamp`.

```ruby
class Version
  include Comparable
  attr_reader :n
  def initialize(n) = @n = n
  def <=>(other) = n <=> other.n
end

Version.new(1) < Version.new(2)
# => true
```

### `group_by` and `tally` summarize a collection

`group_by` returns a hash from each key to its elements. `tally` returns a hash from each element to its count.

```ruby
people = [
  { name: "Alice", dept: "eng" },
  { name: "Bob", dept: "eng" },
  { name: "Carol", dept: "hr" }
]
people.group_by { |p| p[:dept] }
# => {"eng" => [Alice, Bob],
#     "hr" => [Carol]}

["a", "b", "a", "c", "b", "a"].tally
# => {"a"=>3, "b"=>2, "c"=>1}
```

### Predicates and `min_by`, `max_by` aggregate

```ruby
[2, 4, 6].all?(&:even?)   # => true
[1, 2, 3].any?(&:even?)   # => true
[1, 3, 5].none?(&:even?)  # => true
[1, 2, 3].count(&:odd?)   # => 2
[3, 1, 4].min_by { |n| n } # => 1
[3, 1, 4].max_by { |n| n } # => 4
```

### `lazy` computes values only on demand

Use `lazy` for a large or infinite collection, for an external source, or for a chain that can stop early. `to_a`, `first(n)` or `force` pulls the results out.

```ruby
# Hangs: select reads the whole range
(1..Float::INFINITY).select(&:odd?)

(1..Float::INFINITY).lazy
  .select(&:odd?)
  .first(5)
# => [1, 3, 5, 7, 9]
```

## Watch out

- `sort_by` is not stable. For a tie-break, put it in the key, for example `[-freq, word]`.
- `select`, `map` or `sort_by` on an infinite range without `.lazy` hangs forever.
- `.lazy` must come before the chain. You still need `.first(n)` or `.force` at the end.
- `Hash.new(0)` makes `h[word] += 1` work for a new key. `fetch` ignores the default and raises `KeyError`.
- `min_by` and `max_by` return `nil` on an empty collection. They do not raise.

## The task

Write three functions in `stub.rb` with `Enumerable` methods such as `each_with_object`, `sort_by` and `lazy`.

1. `top_n_words(text, n)` splits `text` on whitespace and counts each word.
2. `top_n_words` returns the `n` most frequent words as an `Array` of strings, most frequent first.
3. Words with equal counts come in alphabetical order.
4. If `text` has fewer than `n` distinct words, `top_n_words` returns all of them.
5. `running_total(nums)` returns an `Array` the same length as `nums`.
6. Each element of that array is the sum of `nums` up to and including that index.
7. `first_n_multiples(base, n)` returns the first `n` positive multiples of `base` as an `Array`.
8. `first_n_multiples` must use a lazy enumerator over an infinite range.

An empty string gives `[]`. An empty array gives `[]`. `n = 0` gives `[]`.

```ruby
text = "the cat sat on the mat the cat"
top_n_words(text, 2)  # => ["the", "cat"]
top_n_words(text, 1)  # => ["the"]
top_n_words("a b a b c", 2)
# => ["a", "b"]
top_n_words("", 3)       # => []
top_n_words("hello", 5)  # => ["hello"]

running_total([1, 2, 3, 4, 5])
# => [1, 3, 6, 10, 15]
running_total([5])        # => [5]
running_total([1, -1, 3]) # => [1, 0, 3]
running_total([])         # => []

first_n_multiples(3, 5)
# => [3, 6, 9, 12, 15]
first_n_multiples(7, 3)   # => [7, 14, 21]
first_n_multiples(10, 1)  # => [10]
first_n_multiples(4, 0)   # => []
```
