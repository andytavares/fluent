## What you build

You write four methods that use keyword arguments, `yield` and blocks captured as `Proc` objects. This lesson builds on **Variables & Types**.

## Key concepts

### A method returns its last expression

Idiomatic Ruby uses an explicit `return` only for an early exit. Unlike JavaScript, Python and Go, Ruby needs no `return` at the end.

```ruby
def greet(name)
  "Hello, #{name}!"
end
```

### Parameters can have defaults and keywords

A positional parameter can have a default value. The caller names a keyword parameter (`ssl:`) at the call site.

```ruby
def connect(host, port = 5432, ssl: false)
end

connect("db.example.com")
connect("db.example.com", 3306)
connect("db.example.com", ssl: true)
```

### Splats collect the remaining arguments

`*args` collects the remaining positional arguments into an array. `**kwargs` collects the remaining keyword arguments into a hash.

```ruby
def log(level, *messages)
  messages.each do |m|
    puts "[#{level}] #{m}"
  end
end
log(:info, "started", "ready")

def tag(name, **attrs)
  pairs = attrs.map do |k, v|
    "#{k}=\"#{v}\""
  end
  "<#{name} #{pairs.join(" ")}>"
end

# Returns <a href="/home" class="nav">
tag(:a, href: "/home", class: "nav")
```

### A method calls its block with `yield`

A block is an anonymous piece of code that you pass to a method, outside the argument list. The method runs it with `yield`, and the caller never names it. JavaScript has no match for this: there, you pass a callback as an argument.

```ruby
def repeat(n)
  n.times { yield }
end

# Prints "hi" three times
repeat(3) { puts "hi" }
```

### `block_given?` makes the block optional

`block_given?` returns `true` when the caller passed a block.

```ruby
def maybe_transform(value)
  block_given? ? yield(value) : value
end

maybe_transform(5)              # => 5
maybe_transform(5) { |v| v * 2 } # => 10
```

### `&` captures the block as a `Proc`

Put `&` before the last parameter to capture the block as a named `Proc` object. Run it with `.call`, `.()` or `yield`.

```ruby
def apply(value, &transformer)
  transformer.call(value)
end

apply(4) { |n| n ** 2 }  # => 16
```

### `&` at the call site passes a callable as a block

The same `&` passes a `Proc` or a symbol as the block. `&:strip` works because `Symbol#to_proc` makes a proc that calls `.strip` on its argument.

```ruby
doubler = ->(n) { n * 2 }
[1, 2, 3].map(&doubler)
# => [2, 4, 6]

[" a ", " b "].map(&:strip)
# => ["a", "b"]
```

## Watch out

- `yield` with no block raises `LocalJumpError: no block given`. Check `block_given?` or `block.nil?` when the block is optional.
- A method can capture only one block. `&block` must be the last parameter.
- A missing required keyword argument raises `ArgumentError: missing keyword`. It does not become `nil`.
- `&block` is a `Proc` object. Run it with `block.call(x)` or `block.(x)`, not `block(x)`.

## The task

Write four methods in `stub.rb`. They use splat and keyword arguments, `yield` and captured blocks.

1. `repeat_call(n, &block)` calls `block` exactly `n` times. It passes the iteration index, from 0, each time.
2. `repeat_call` returns `nil`, whatever the block returns.
3. `transform_all(values, &block)` applies `block` to each element of `values`.
4. `transform_all` returns a new array of the results and does not change `values`.
5. With no block, `transform_all` returns `values` unchanged.
6. `build_logger(prefix)` returns a `Proc`. Called with a message, the `Proc` returns `"#{prefix}: #{message}"`.
7. `keyword_summary(name:, age:, city: "Unknown")` returns `"#{name}, age #{age}, from #{city}"`.
8. In `keyword_summary`, the caller must pass `name` and `age`. `city` defaults to `"Unknown"`.

When `n` is 0, `repeat_call` never calls the block. An empty array gives an empty array.

```ruby
seen = []
repeat_call(3) { |i| seen << i }
# => nil, and seen is [0, 1, 2]
repeat_call(0) { |i| seen << i }
# => nil, and the block never runs

transform_all([1, 2, 3]) { |n| n * 2 }
# => [2, 4, 6]
transform_all(["a", "b"]) { |s| s.upcase }
# => ["A", "B"]
transform_all([1, 2, 3])
# => [1, 2, 3]
transform_all([]) { |n| n }
# => []

info = build_logger("INFO")
info.call("server started")
# => "INFO: server started"
info.call("")
# => "INFO: "

keyword_summary(name: "Bob", age: 25)
# => "Bob, age 25, from Unknown"
# Returns "Alice, age 30, from Portland":
keyword_summary(name: "Alice", age: 30,
                city: "Portland")
```
