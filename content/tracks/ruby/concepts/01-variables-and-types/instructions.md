## What you build

You write four small functions that inspect runtime types, make symbols, divide safely and interpolate strings.

## Key concepts

### Assignment is the declaration

A Ruby variable needs no type annotation and no keyword like `let` or `var`.

```ruby
name = "Alice"
count = 42
ratio = 3.14
active = true
nothing = nil
```

### A symbol is one shared object

A symbol like `:status` is an immutable, interned identifier. Two symbols with the same name are always the same object. They are cheap to compare, so Ruby code uses them as hash keys, flags and named parameters.

```ruby
:ok == :ok
# => true
:ok.object_id == :ok.object_id
# => true: one object in memory
"ok".object_id == "ok".object_id
# => false: two heap allocations

:hello.to_s      # => "hello"
"hello".to_sym   # => :hello
```

### String literals are mutable

By default, you can change a string literal in place. Freeze a string to make it immutable, so the runtime can intern it like a symbol.

```ruby
s = "hello"
s << " world"
s  # => "hello world"

GREETING = "hello".freeze
# Raises FrozenError:
GREETING << " world"
```

A file with `# frozen_string_literal: true` at the top freezes all its string literals.

### Only double quotes interpolate

Use `#{}` inside double-quoted strings. Single-quoted strings are literal: no interpolation, and no escape sequences except `\\` and `\'`.

```ruby
lang = "Ruby"
puts "Hello from #{lang}!"
# Hello from Ruby!
puts 'Hello from #{lang}!'
# Hello from #{lang}!
puts "Two plus two is #{2 + 2}"
# Two plus two is 4
```

### Integers never overflow

Ruby integers have arbitrary precision. Division of two integers gives an integer and rounds toward negative infinity. Use `fdiv` for a float result.

```ruby
10 / 3      # => 3
-7 / 2      # => -4
10.0 / 3    # => 3.3333333333333335
10.fdiv(3)  # => 3.3333333333333335

-5.abs        # => 5
2 ** 10       # => 1024
255.to_s(16)  # => "ff"
```

### `nil` is an object

`nil` is the one instance of `NilClass`, not a null pointer. Only `nil` and `false` are falsy. `0`, `""` and `[]` are all truthy, unlike in Python or JavaScript.

```ruby
nil.nil?  # => true
nil.to_s  # => ""
nil.to_a  # => []
nil.to_i  # => 0
```

### Check and convert types with methods

`is_a?` checks a class and its ancestors. The `to_*` methods convert between types.

```ruby
42.is_a?(Integer)   # => true
42.is_a?(Numeric)   # => true
"hi".is_a?(String)  # => true

"42".to_i  # => 42
42.to_s    # => "42"
3.14.to_i  # => 3
```

## Watch out

- `if value` is true for every value except `nil` and `false`. `0` and `""` are true, which breaks code ported from Python or JavaScript.
- A symbol and a string with the same characters are never `==`. `h["name"]` on a symbol-keyed hash returns `nil` and raises nothing.
- `<<` changes a string in place, and `+` makes a new one. After `t = s; s << "b"`, `t` also shows the change.
- `-7 / 2` is `-4` in Ruby, not `-3` as in C. Use `fdiv` when you need the exact float result.

## The task

Write four functions in `stub.rb`. They use runtime types, symbols, `nil` and string interpolation.

1. `describe_type(value)` returns the type of `value` as a string. It returns `"integer"`, `"float"`, `"string"`, `"symbol"`, `"boolean"` or `"nil"`.
2. `describe_type` returns `"boolean"` for both `true` and `false`.
3. `to_symbol(str)` converts a `String` to a `Symbol`. An empty string gives `:""`.
4. `safe_divide(a, b)` returns `a.fdiv(b)`, a float.
5. `safe_divide` returns `nil` when `b` is zero. It must not raise `ZeroDivisionError`.
6. `interpolate_greeting(name, lang)` returns `"Hello, #{name}! Welcome to #{lang}."` with string interpolation.

Negative numbers, zero and empty strings follow the same rules.

```ruby
describe_type(42)     # => "integer"
describe_type(-0.5)   # => "float"
describe_type("")     # => "string"
describe_type(:ok)    # => "symbol"
describe_type(false)  # => "boolean"
describe_type(nil)    # => "nil"

to_symbol("foo_bar")  # => :foo_bar
to_symbol("")         # => :""

safe_divide(10, 2)    # => 5.0
safe_divide(1, 2)     # => 0.5
safe_divide(-5, 2)    # => -2.5
safe_divide(10, 0)    # => nil
safe_divide(0, 0)     # => nil

interpolate_greeting("Bob", "Go")
# => "Hello, Bob! Welcome to Go."
interpolate_greeting("", "Ruby")
# => "Hello, ! Welcome to Ruby."
```
