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

## The task

Implement these methods:

```ruby
def repeat_call(n, &block)
  # Call block n times, passing the iteration index (0-based). Return nil.
end

def transform_all(values, &block)
  # Apply block to each element of values. Return a new array of results.
  # If no block given, return values unchanged.
end

def build_logger(prefix)
  # Return a Proc that, when called with a message string, returns "#{prefix}: #{message}"
end

def keyword_summary(name:, age:, city: "Unknown")
  # Return "#{name}, age #{age}, from #{city}"
end
```
