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

## Watch out

- `if value` treats every non-`nil`, non-`false` value as true — including `0` and `""`. Coming from Python or JS, this is the single most common source of bugs in ported code.
- `"a".to_sym` and `"a"` are never `==` — a symbol and a string with the same characters are different objects of different classes. Hash lookups with the wrong key type (`h["name"]` vs `h[:name]`) silently return `nil` instead of raising.
- `<<` mutates a string in place; `+` does not. `s = "a"; t = s; s << "b"` also changes what `t` sees, because both variables reference the same string object.
- `10 / 3` truncates toward zero like integer division in C — but `-7 / 2` is `-4` in Ruby (floors), not `-3` (truncates), because `Integer#/` floors. Use `.fdiv` when you want the exact float result.

## The task

Implement four small utility functions that exercise Ruby's type system, symbols, `nil`, and string interpolation.

**`describe_type(value)`** — returns a `String` describing `value`'s runtime type: `"integer"`, `"float"`, `"string"`, `"symbol"`, `"boolean"` (for both `true` and `false`), or `"nil"`.

```ruby
describe_type(42)     # => "integer"
describe_type(3.14)   # => "float"
describe_type("hi")   # => "string"
describe_type(:ok)    # => "symbol"
describe_type(true)   # => "boolean"
describe_type(false)  # => "boolean"
describe_type(nil)    # => "nil"
```

**`to_symbol(str)`** — converts a `String` to a `Symbol`.

```ruby
to_symbol("hello")    # => :hello
to_symbol("foo_bar")  # => :foo_bar
to_symbol("")         # => :""
```

**`safe_divide(a, b)`** — returns `a.fdiv(b)` (float division), but returns `nil` instead of raising when `b` is zero.

```ruby
safe_divide(10, 3)   # => 3.3333333333333335
safe_divide(10, 2)   # => 5.0
safe_divide(10, 0)   # => nil  — no ZeroDivisionError
safe_divide(0, 0)    # => nil
safe_divide(-5, 2)   # => -2.5
```

**`interpolate_greeting(name, lang)`** — returns `"Hello, #{name}! Welcome to #{lang}."` using string interpolation.

```ruby
interpolate_greeting("Alice", "Ruby")  # => "Hello, Alice! Welcome to Ruby."
interpolate_greeting("", "Ruby")       # => "Hello, ! Welcome to Ruby."
```
