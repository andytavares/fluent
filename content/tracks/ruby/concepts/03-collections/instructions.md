# Collections

## What you'll learn

Ruby's Array and Hash APIs — the core functional iteration methods, destructuring, and `each_with_object` for accumulator patterns.

## Key concepts

### Array basics

Arrays are ordered, dynamically typed, and zero-indexed.

```ruby
nums = [1, 2, 3, 4, 5]
nums[0]     # => 1
nums[-1]    # => 5
nums[1..3]  # => [2, 3, 4]  (inclusive range)
nums[1...3] # => [2, 3]     (exclusive range)
```

Common mutation:

```ruby
nums.push(6)   # append, alias: nums << 6
nums.pop       # remove and return last
nums.shift     # remove and return first
nums.unshift(0)  # prepend
```

### Functional iteration

These return new arrays without mutating the original:

```ruby
[1, 2, 3].map { |n| n * 2 }     # => [2, 4, 6]
[1, 2, 3].select { |n| n > 1 }  # => [2, 3]
[1, 2, 3].reject { |n| n > 1 }  # => [1]
[1, 2, 3].reduce(0) { |sum, n| sum + n }  # => 6
# or with a symbol shorthand:
[1, 2, 3].reduce(:+)  # => 6
```

`flat_map` is `map` followed by a one-level flatten:

```ruby
[[1, 2], [3, 4]].flat_map { |a| a.map { |n| n * 10 } }
# => [10, 20, 30, 40]
```

### each_with_object

When you need to build up a result object while iterating, `each_with_object` is cleaner than `reduce` for mutable accumulators:

```ruby
words = ["foo", "bar", "foo", "baz"]
counts = words.each_with_object(Hash.new(0)) do |word, acc|
  acc[word] += 1
end
# => {"foo"=>2, "bar"=>1, "baz"=>1}
```

`Hash.new(0)` creates a hash whose missing keys default to `0` instead of `nil`.

### Hash basics

Hashes are ordered (since Ruby 1.9) key-value stores. Symbol keys use the `key:` shorthand in literals:

```ruby
config = { host: "localhost", port: 5432 }
config[:host]           # => "localhost"
config[:missing]        # => nil
config.fetch(:missing)  # raises KeyError
config.fetch(:missing, "default")  # => "default"
```

String and symbol keys are different:

```ruby
h = { "name" => "Alice", name: "Bob" }
h["name"]  # => "Alice"
h[:name]   # => "Bob"
```

### Hash iteration and transformation

```ruby
{ a: 1, b: 2 }.map { |k, v| [k, v * 10] }.to_h
# => {a: 10, b: 20}

# idiomatic Ruby 2.6+:
{ a: 1, b: 2 }.transform_values { |v| v * 10 }
# => {a: 10, b: 20}

{ a: 1, b: 2 }.select { |k, v| v > 1 }
# => {b: 2}
```

### Array decomposition

```ruby
first, *rest = [1, 2, 3, 4]
# first => 1, rest => [2, 3, 4]

a, b = [10, 20]
# a => 10, b => 20
```

## vs other languages

| | Ruby | Python | JavaScript | Go |
|---|---|---|---|---|
| Hash / dict literal | `{ key: val }` | `{"key": val}` | `{ key: val }` | `map[K]V{k: v}` |
| Missing key | `nil` | `KeyError` | `undefined` | zero value |
| Map function name | `.map` | `map()` builtin | `.map` | no builtin — use loop |
| Filter function name | `.select` | `filter()` | `.filter` | no builtin |
| Splat / spread | `*rest` in assign | `*rest` | `...rest` | none |

One trap: `Hash[]` and `{}` are both valid hash literals, but `{}` at the start of a statement is parsed as a block, not a hash. Always use parentheses or assign to a variable when a bare `{}` would be ambiguous.

## The task

```ruby
def sum_of_squares(nums)
  # Return the sum of squares of each number in nums
end

def words_longer_than(words, min_length)
  # Return words whose length is strictly greater than min_length
end

def invert_hash(h)
  # Swap keys and values. Assume values are unique.
end

def group_by_first_letter(words)
  # Return a Hash mapping the first letter (String) to an Array of matching words.
  # E.g. ["apple", "avocado", "banana"] => { "a" => ["apple", "avocado"], "b" => ["banana"] }
end
```
