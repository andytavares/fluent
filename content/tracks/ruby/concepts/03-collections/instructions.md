## What you build

You write four functions that sum squares, filter words, invert a hash and group words by first letter. This lesson builds on **Methods & Blocks**.

## Key concepts

### Arrays start at index 0

An array keeps its order and holds values of any type. A negative index counts from the end. `1..3` includes the end, and `1...3` excludes it.

```ruby
nums = [1, 2, 3, 4, 5]
nums[0]      # => 1
nums[-1]     # => 5
nums[1..3]   # => [2, 3, 4]
nums[1...3]  # => [2, 3]

# Append, same as nums << 6
nums.push(6)
# Remove and return the last
nums.pop
# Remove and return the first
nums.shift
# Prepend
nums.unshift(0)
```

### `map`, `select`, `reject` and `reduce` return new values

These methods do not change the original array. `select` is the Ruby name for `filter` in JavaScript and Python.

```ruby
[1, 2, 3].map { |n| n * 2 }
# => [2, 4, 6]
[1, 2, 3].select { |n| n > 1 }  # => [2, 3]
[1, 2, 3].reject { |n| n > 1 }  # => [1]
[1, 2, 3].reduce(0) { |s, n| s + n }
# => 6
[1, 2, 3].reduce(:+)            # => 6
```

### `flat_map` maps, then flattens one level

```ruby
[[1, 2], [3, 4]].flat_map do |a|
  a.map { |n| n * 10 }
end
# => [10, 20, 30, 40]
```

### `each_with_object` builds a mutable result

When you build up a result object, `each_with_object` is cleaner than `reduce`. `Hash.new(0)` makes a hash whose missing keys give `0` instead of `nil`.

```ruby
words = ["foo", "bar", "foo", "baz"]
counts = words.each_with_object(
  Hash.new(0)
) do |word, acc|
  acc[word] += 1
end
# => {"foo"=>2, "bar"=>1, "baz"=>1}
```

### Hashes keep insertion order

Hashes keep insertion order since Ruby 1.9. A literal with `key:` makes symbol keys. A missing key gives `nil` with `[]`, but `fetch` raises `KeyError`.

```ruby
config = { host: "localhost", port: 5432 }
config[:host]           # => "localhost"
config[:missing]        # => nil
config.fetch(:missing)  # raises KeyError
config.fetch(:missing, "default")
# => "default"
```

### String keys and symbol keys differ

`"name"` and `:name` are two different keys.

```ruby
h = { "name" => "Alice", name: "Bob" }
h["name"]  # => "Alice"
h[:name]   # => "Bob"
```

### Hashes have their own transforms

`transform_values` (Ruby 2.4 or later) maps the values and keeps the keys. `select` on a hash returns a hash.

```ruby
h = { a: 1, b: 2 }
h.map { |k, v| [k, v * 10] }.to_h
# => {a: 10, b: 20}

h.transform_values { |v| v * 10 }
# => {a: 10, b: 20}

h.select { |k, v| v > 1 }
# => {b: 2}
```

### Assignment can split an array

`*` collects the rest of the values, like `...rest` in JavaScript.

```ruby
first, *rest = [1, 2, 3, 4]
# first is 1, rest is [2, 3, 4]

a, b = [10, 20]
# a is 10, b is 20
```

## Watch out

- `Hash.new([])` gives every missing key the same array. A push for one key changes all of them.
- For a fresh array per key, use `Hash.new { |h, k| h[k] = [] }`.
- `h[:missing]` returns `nil`, and `h.fetch(:missing)` raises `KeyError`. Use `fetch` when a missing key is a bug.
- `JSON.parse` output has string keys, and a literal has symbol keys. A lookup with the wrong type returns `nil`.
- `nums[10]` on a 3-element array returns `nil`. Only `Array#fetch` raises `IndexError`.
- `{}` right after a method name is a block, not a hash: `puts {}` passes an empty block. Use parentheses: `puts({})`.

## The task

Write four functions in `stub.rb`. They use array iteration, hash transformation and grouping.

1. `sum_of_squares(nums)` returns the sum of the square of each number in `nums`.
2. `words_longer_than(words, min_length)` returns the words whose length is strictly greater than `min_length`.
3. `words_longer_than` keeps the original order.
4. `invert_hash(h)` returns a new `Hash` with the keys and values swapped. All values in `h` are unique.
5. `group_by_first_letter(words)` returns a `Hash` from each first letter, as a `String`, to an `Array` of words.
6. Each group keeps the original order of its words.

Empty input gives `0`, `[]` or `{}`. A letter that starts no word is not a key, so it reads as `nil`.

```ruby
sum_of_squares([1, 2, 3, 4])   # => 30
sum_of_squares([5])            # => 25
sum_of_squares([-1, -2, -3])   # => 14
sum_of_squares([])             # => 0

words_longer_than(
  ["hi", "hello", "hey", "greetings"], 3
)
# => ["hello", "greetings"]
words_longer_than(["apple", "fig"], 3)
# => ["apple"]
words_longer_than(["a", "bb", "ccc"], 5)
# => []
words_longer_than([], 2)       # => []

invert_hash({ a: 1, b: 2 })
# => {1 => :a, 2 => :b}
invert_hash({ "foo" => "x" })
# => {"x" => "foo"}
invert_hash({})                # => {}

g = group_by_first_letter(
  ["apple", "avocado", "banana", "apricot"]
)
g["a"]
# => ["apple", "avocado", "apricot"]
g["b"]  # => ["banana"]
g["c"]  # => nil
group_by_first_letter([])      # => {}
```
