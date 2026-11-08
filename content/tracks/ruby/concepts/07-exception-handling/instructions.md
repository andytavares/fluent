## What you build

You write a custom exception class, a parser that raises two error types, and a helper that retries a failing block. This lesson builds on **Blocks, Procs & Lambdas**.

## Key concepts

### `begin`, `rescue` and `ensure` handle exceptions

`rescue` catches an exception class. `ensure` runs whether or not the code raised, like `finally` in Java or JavaScript.

```ruby
begin
  result = 10 / 0
rescue ZeroDivisionError => e
  puts "Caught: #{e.message}"
ensure
  puts "Always runs"
end
```

### A method body needs no `begin`

When the whole method body is the guarded code, put `rescue` straight in the method.

```ruby
def parse_int(str)
  Integer(str)
rescue ArgumentError
  nil
end

parse_int("42")   # => 42
parse_int("abc")  # => nil
```

### One `rescue` can catch many classes

List the classes, or rescue a parent class. A parent class also catches all its subclasses.

```ruby
begin
  Integer(input)
rescue TypeError, ArgumentError => e
  puts e.message
end

begin
  risky_call
rescue StandardError => e
  # Not SignalException or SystemExit
  puts e.message
end
```

### `raise` takes a class and a message

`raise "message"` is short for `raise RuntimeError, "message"`. A bare `raise` inside `rescue` raises the current exception again.

```ruby
raise ArgumentError, "must be positive"
raise RuntimeError
# Inside rescue only:
raise
```

### A custom exception inherits from `StandardError`

Inherit from `StandardError`, or a more specific class, for application errors. Call `super` with the message.

```ruby
class NoFundsError < StandardError
  attr_reader :amount

  def initialize(amount)
    @amount = amount
    super("Insufficient funds: need " \
          "#{amount} more")
  end
end

def withdraw(balance, amount)
  short = amount - balance
  if short > 0
    raise NoFundsError.new(short)
  end
  balance - amount
end

begin
  withdraw(50, 100)
rescue NoFundsError => e
  e.message
  # => "Insufficient funds: need 50 more"
  e.amount  # => 50
end
```

### `retry` runs the `begin` block again

`retry` starts the `begin` block again from the top. Count the attempts outside the block, or it can loop forever. Java, Python and Go have no `retry` keyword.

```ruby
attempts = 0
begin
  attempts += 1
  result = flaky_network_call
rescue Timeout::Error
  retry if attempts < 3
  # Give up after 3 attempts
  raise
end
```

### `StandardError` is the class to rescue

This tree shows the main classes only.

```
Exception
├── SignalException
├── SystemExit
└── StandardError
    ├── RuntimeError
    ├── ArgumentError
    ├── TypeError
    ├── NameError
    │   └── NoMethodError
    ├── IOError
    ├── ZeroDivisionError
    └── your custom classes
```

`rescue Exception` also catches signals and `SystemExit`, so Ctrl-C and `exit` stop working. Rescue `StandardError` or a more specific class.

### Raise for exceptional cases only

Idiomatic Ruby raises for exceptional conditions. For expected failures, it returns `nil` or a sentinel value, like the `ok` result in Go, but the caller gets no forced check.

## Watch out

- Ruby checks `rescue` clauses from top to bottom. Put specific classes before `StandardError`.
- A bare `rescue` catches only `StandardError` and its subclasses, never `Exception`.
- `Integer("abc")` raises `ArgumentError`, but `Integer(nil)` raises `TypeError`. Rescue only `ArgumentError`, and `nil` gets past it.
- `ensure` runs even after `return` or another exception.
- A `return` inside `ensure` discards the exception in flight, with no message.
- `retry` runs the whole `begin` block again, with its side effects. Count attempts outside that block.

## The task

Write a custom exception class and two methods in `stub.rb`. They raise, rescue and retry.

1. `ValidationError < StandardError` has `attr_reader :field`.
2. `ValidationError#initialize(field, message)` stores `field`. It calls `super` with `"#{field}: #{message}"`.
3. `parse_positive_integer(str)` parses `str` with `Integer(str)` and returns the integer.
4. If `str` is not an integer string, it raises `ArgumentError`. An empty string and `"3.14"` raise it too.
5. If the integer is 0 or less, it raises `RangeError`.
6. `with_retry(max_attempts, &block)` calls `block` and returns its value on the first success.
7. If `block` raises a `StandardError`, `with_retry` calls it again, up to `max_attempts` calls in total.
8. If the last attempt raises, `with_retry` raises that exception to the caller.

```ruby
err = ValidationError.new(
  "email", "is invalid"
)
err.message  # => "email: is invalid"
err.field    # => "email"
err.is_a?(StandardError)  # => true
ValidationError.new("age", "must be >= 18")
  .message  # => "age: must be >= 18"

parse_positive_integer("42")    # => 42
parse_positive_integer("1")     # => 1
parse_positive_integer("999")   # => 999
# Each raises ArgumentError:
parse_positive_integer("abc")
parse_positive_integer("")
parse_positive_integer("3.14")
# Each raises RangeError:
parse_positive_integer("0")
parse_positive_integer("-5")

calls = 0
with_retry(3) do
  calls += 1
  raise "fail" if calls < 3
  "success"
end
# => "success", calls is 3

with_retry(1) { "immediate" }
# => "immediate", block called once

# RuntimeError after 3 calls:
with_retry(3) { raise "persistent" }
```
