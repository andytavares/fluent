# Methods & Blocks

## What you'll learn

How Ruby defines methods with optional, keyword, and splat arguments — and how blocks make Ruby's iteration and callback model work.

## Key concepts

### Method definition

```ruby
def greet(name)
  "Hello, #{name}!"
end
```

Ruby methods return the value of their last expression. An explicit `return` is valid but idiomatic Ruby only uses it for early exits.

### Optional and default arguments

```ruby
def connect(host, port = 5432, ssl: false)
  # host is required, port defaults to 5432, ssl is a keyword arg
end

connect("db.example.com")
connect("db.example.com", 3306)
connect("db.example.com", ssl: true)
```

### Splat and double-splat

`*args` collects remaining positional arguments into an array. `**kwargs` collects remaining keyword arguments into a hash.

```ruby
def log(level, *messages)
  messages.each { |m| puts "[#{level}] #{m}" }
end

log(:info, "started", "ready")  # two messages

def tag(name, **attrs)
  attr_str = attrs.map { |k, v| "#{k}=\"#{v}\"" }.join(" ")
  "<#{name} #{attr_str}>"
end

tag(:a, href: "/home", class: "nav")  # => '<a href="/home" class="nav">'
```

### Blocks

A block is an anonymous chunk of code you pass to a method. The method invokes it with `yield`. This is the backbone of Ruby's iteration idioms.

```ruby
def repeat(n)
  n.times { yield }
end

repeat(3) { puts "hi" }
# hi
# hi
# hi
```

Use `block_given?` to make the block optional:

```ruby
def maybe_transform(value)
  block_given? ? yield(value) : value
end

maybe_transform(5)          # => 5
maybe_transform(5) { |v| v * 2 }  # => 10
```

### Capturing a block as a Proc

Prefix the last parameter with `&` to capture the block as a named Proc object. You can then call it with `.call`, `.(...)`, or `yield`.

```ruby
def apply(value, &transformer)
  transformer.call(value)
end

apply(4) { |n| n ** 2 }  # => 16
```

Passing a named Proc or method as a block uses the same `&` sigil at the call site:

```ruby
doubler = ->(n) { n * 2 }
[1, 2, 3].map(&doubler)  # => [2, 4, 6]

[" a ", " b "].map(&:strip)  # => ["a", "b"]  — Symbol#to_proc
```

`&:strip` works because `Symbol#to_proc` converts `:strip` into a proc that calls `.strip` on its argument.

## vs other languages

| | Ruby | JavaScript | Python | Go |
|---|---|---|---|---|
| Implicit return | Yes — last expression | No — need `return` | No | No |
| Anonymous callable | Block / Proc / Lambda | Arrow function | Lambda / def | func literal |
| Named keyword args | Built-in (`key:`) | Destructured object | `**kwargs` or explicit | Struct param |
| Yield mechanism | `yield` keyword | No — pass function explicitly | `yield` (generators only) | No equivalent |

The block mechanism has no direct parallel in most languages. In JavaScript you pass a callback function explicitly as an argument. Ruby's blocks sit outside the argument list and are passed implicitly — the called method can `yield` to them without the caller ever naming them.

## Watch out

- `yield` without `block_given?` raises `LocalJumpError: no block given` if the caller didn't pass one. Always guard with `block_given?` (or capture with `&block` and check `block.nil?`) when the block is optional.
- A method can only capture **one** block — `&block` must be the last parameter, and there's no way to accept two separate blocks.
- Required keyword arguments (`name:` with no default) raise `ArgumentError: missing keyword` if omitted — unlike positional defaults, there's no silent `nil` fallback.
- `&block` inside the method is a real `Proc` object; you must call it with `.call` (or `.()`), not invoke it like a bare `block(x)`.

## The task

Implement four methods that exercise splat/keyword arguments, `yield`, and capturing blocks as `Proc`s.

**`repeat_call(n, &block)`** — calls `block` exactly `n` times, passing the 0-based iteration index each time. Returns `nil` regardless of what the block returns.

```ruby
repeat_call(3) { |i| puts i }   # prints 0, 1, 2 — returns nil
repeat_call(0) { |i| puts i }   # prints nothing — returns nil
```

**`transform_all(values, &block)`** — applies `block` to each element of the `values` array and returns a **new** array of the results, leaving `values` untouched. If no block is given, returns `values` unchanged.

```ruby
transform_all([1, 2, 3]) { |n| n * 2 }      # => [2, 4, 6]
transform_all(["a", "b"]) { |s| s.upcase }  # => ["A", "B"]
transform_all([1, 2, 3])                    # => [1, 2, 3]  — no block given
transform_all([])          { |n| n }        # => []
```

**`build_logger(prefix)`** — returns a `Proc` that, when called with a message string, returns `"#{prefix}: #{message}"`.

```ruby
info = build_logger("INFO")
info.call("server started")  # => "INFO: server started"
info.call("")                # => "INFO: "
```

**`keyword_summary(name:, age:, city: "Unknown")`** — `name` and `age` are required keyword arguments; `city` defaults to `"Unknown"`. Returns `"#{name}, age #{age}, from #{city}"`.

```ruby
keyword_summary(name: "Alice", age: 30, city: "Portland")  # => "Alice, age 30, from Portland"
keyword_summary(name: "Bob", age: 25)                      # => "Bob, age 25, from Unknown"
```
