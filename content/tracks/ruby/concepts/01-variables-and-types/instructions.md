# Variables & Types

## What you'll learn

How Ruby's dynamic type system works, the difference between strings and symbols, how nil behaves, and how Ruby handles numeric types.

## Key concepts

### Dynamic typing with no declarations

Ruby variables need no type annotation and no keyword like `let` or `var`. Assignment is the declaration.

```ruby
name = "Alice"
count = 42
ratio = 3.14
active = true
nothing = nil
```

### Symbols

Symbols are Ruby's most distinctive type for newcomers. A symbol like `:status` is an immutable, interned identifier. Two symbols with the same name are the same object — guaranteed. They're cheap to compare and ideal as hash keys, flags, or named parameters.

```ruby
:ok == :ok        # => true
:ok.object_id == :ok.object_id  # => true — same object in memory

"ok".object_id == "ok".object_id  # => false — two heap allocations
```

Convert between them:

```ruby
:hello.to_s   # => "hello"
"hello".to_sym  # => :hello
```

### Frozen strings

String literals are mutable by default, which can be surprising:

```ruby
s = "hello"
s << " world"   # mutates s in place
s  # => "hello world"
```

Freeze a string to make it immutable and allow the runtime to intern it (like a symbol):

```ruby
GREETING = "hello".freeze
GREETING << " world"  # raises FrozenError
```

In files with `# frozen_string_literal: true` at the top, all string literals are frozen automatically.

### String interpolation

Use `#{}` inside double-quoted strings. Single-quoted strings are literal — no interpolation, no escape sequences except `\\` and `\'`.

```ruby
lang = "Ruby"
puts "Hello from #{lang}!"       # => Hello from Ruby!
puts 'Hello from #{lang}!'       # => Hello from #{lang}!
puts "Two plus two is #{2 + 2}"  # => Two plus two is 4
```

### Integer and Float

Ruby integers are arbitrary precision — no overflow. Integer division truncates (same as C, Java, Go).

```ruby
10 / 3      # => 3  (integer division)
10.0 / 3    # => 3.3333...
10.fdiv(3)  # => 3.3333...  (explicit float division from integers)
```

Useful integer methods:

```ruby
-5.abs      # => 5
2 ** 10     # => 1024
255.to_s(16)  # => "ff"  (hex string)
```

### nil

`nil` is an object (instance of `NilClass`), not a pointer or a keyword for absence of value. It's falsy. Only `nil` and `false` are falsy in Ruby — `0`, `""`, and `[]` are all truthy.

```ruby
nil.nil?     # => true
nil.to_s     # => ""
nil.to_a     # => []
nil.to_i     # => 0
```

### Type predicates and conversion

```ruby
42.is_a?(Integer)   # => true
42.is_a?(Numeric)   # => true
"hi".is_a?(String)  # => true

"42".to_i   # => 42
42.to_s     # => "42"
3.14.to_i   # => 3
```

## vs other languages

| | Ruby | Python | JavaScript | Go |
|---|---|---|---|---|
| Undefined vs nil | Only `nil` | `None` | `undefined` + `null` | zero values per type |
| Falsy values | `nil`, `false` only | `None`, `0`, `""`, `[]` | `null`, `undefined`, `0`, `""`, `NaN` | no implicit truthiness |
| Integer overflow | Never (arbitrary precision) | Never | At 2^53 (floats) | Wraps (int64) |
| Symbols | Yes — `:name` | No (use strings or enums) | No | No |
| String mutability | Mutable by default | Immutable | Immutable | Immutable |

The "only `nil` and `false` are falsy" rule catches everyone coming from Python or JavaScript. `0` is truthy. `""` is truthy. `[]` is truthy. Plan accordingly.

## The task

Implement these utility functions:

```ruby
def describe_type(value)
  # Return a string: "integer", "float", "string", "symbol", "boolean", or "nil"
end

def to_symbol(str)
  # Convert a string to a symbol
end

def safe_divide(a, b)
  # Return a.fdiv(b), but return nil if b is zero
end

def interpolate_greeting(name, lang)
  # Return "Hello, #{name}! Welcome to #{lang}."
end
```
