# Exception Handling

## What you'll learn

Ruby's `begin/rescue/ensure/raise` model, the exception hierarchy, how to define custom exception classes, and the `retry` mechanism.

## Key concepts

### Basic rescue

```ruby
begin
  result = 10 / 0
rescue ZeroDivisionError => e
  puts "Caught: #{e.message}"
ensure
  puts "Always runs"
end
```

`ensure` is `finally` from Java/JS. It runs whether or not an exception was raised.

### rescue inside a method

When the entire method body is the guarded region, you can skip `begin`:

```ruby
def parse_int(str)
  Integer(str)
rescue ArgumentError
  nil
end

parse_int("42")   # => 42
parse_int("abc")  # => nil
```

### Rescuing multiple exception types

```ruby
rescue TypeError, ArgumentError => e
  # handles either
```

Or with a hierarchy — rescuing a parent class also catches all subclasses:

```ruby
rescue StandardError => e
  # catches most runtime errors (but not SignalException, SystemExit, etc.)
```

### raise

```ruby
raise ArgumentError, "value must be positive"
raise                # re-raises the current exception (only inside rescue)
raise RuntimeError   # raises with no message
```

Raising with a class and message is the idiom. `raise "message"` is shorthand for `raise RuntimeError, "message"`.

### Custom exceptions

Inherit from `StandardError` (or a more specific class) for application errors:

```ruby
class InsufficientFundsError < StandardError
  attr_reader :amount

  def initialize(amount)
    @amount = amount
    super("Insufficient funds: need #{amount} more")
  end
end

def withdraw(balance, amount)
  shortfall = amount - balance
  raise InsufficientFundsError.new(shortfall) if shortfall > 0
  balance - amount
end
```

Catching it:

```ruby
begin
  withdraw(50, 100)
rescue InsufficientFundsError => e
  puts e.message   # => "Insufficient funds: need 50 more"
  puts e.amount    # => 50
end
```

### retry

`retry` re-executes the `begin` block from the top. Limit retries to avoid infinite loops:

```ruby
attempts = 0

begin
  attempts += 1
  result = flaky_network_call
rescue TimeoutError
  retry if attempts < 3
  raise  # give up after 3 attempts
end
```

### Exception hierarchy (simplified)

```
Exception
├── SignalException (SIGINT etc.)
├── SystemExit
└── StandardError          ← rescue this or subclasses for app errors
    ├── RuntimeError       ← default for bare `raise "msg"`
    ├── ArgumentError
    ├── TypeError
    ├── NameError
    │   └── NoMethodError
    ├── IOError
    ├── ZeroDivisionError
    └── ...your custom classes
```

Never `rescue Exception` — it catches signals and `SystemExit`, which breaks Ctrl-C and `exit`. Always rescue `StandardError` or a more specific class.

## vs other languages

| | Ruby | Java | Python | Go |
|---|---|---|---|---|
| Syntax | `begin/rescue/ensure` | `try/catch/finally` | `try/except/finally` | explicit error return values |
| Re-raise | `raise` (no args) | `throw` (no args in Java 7+) | `raise` (no args) | return the original error |
| Custom exception | `< StandardError` | `extends Exception` | `(Exception)` subclass | implement `error` interface |
| Retry | `retry` keyword | manual loop | manual loop | manual loop |
| Checked exceptions | No | Yes | No | No |

Go engineers should note: Ruby exceptions are zero-cost when not raised (exceptions are exceptional). The idiomatic approach in Ruby is to raise for truly exceptional conditions and use `nil` / sentinel values for expected failures — similar to Go's `ok` returns, but without the enforced call-site checking.

## Watch out

- `rescue` clauses are checked top-to-bottom, first match wins — put more specific exception classes before `StandardError`. A bare `rescue` (no class named) only catches `StandardError` and subclasses, never `Exception` directly.
- `Integer("abc")` raises `ArgumentError`, but `Integer(nil)` raises `TypeError` — if you only rescue `ArgumentError`, a `nil` input will blow past your handler. Decide up front which inputs are possible.
- `ensure` runs even if the `begin`/method body hits `return` or another exception — don't put a `return` inside `ensure` itself, it silently swallows whatever exception was propagating.
- `retry` re-runs the **entire** `begin` block from the top, including any side effects already performed (e.g. incrementing a counter again) — track attempt counts outside the retried block if you need to bound them.

## The task

Implement a custom exception class and two functions that raise, rescue, and retry.

**`ValidationError < StandardError`** — a custom exception with `attr_reader :field`. `initialize(field, message)` stores `field` and calls `super` with the combined message `"#{field}: #{message}"`.

```ruby
err = ValidationError.new("email", "is invalid")
err.message  # => "email: is invalid"
err.field    # => "email"
err.is_a?(StandardError)  # => true
```

**`parse_positive_integer(str)`** — parses `str` as an integer using `Integer(str)`. Raises `ArgumentError` if `str` is not a valid integer string. Raises `RangeError` if the parsed integer is `<= 0`. Returns the integer on success.

```ruby
parse_positive_integer("42")   # => 42
parse_positive_integer("1")    # => 1
parse_positive_integer("abc")  # raises ArgumentError
parse_positive_integer("3.14") # raises ArgumentError — not an integer string
parse_positive_integer("0")    # raises RangeError
parse_positive_integer("-5")   # raises RangeError
```

**`with_retry(max_attempts, &block)`** — calls `block`. If it raises any `StandardError`, retries the call, up to `max_attempts` total attempts. If the final attempt still raises, re-raises that exception to the caller. Returns `block`'s return value on the first successful call.

```ruby
calls = 0
with_retry(3) do
  calls += 1
  raise "fail" if calls < 3
  "success"
end
# => "success", calls == 3  (succeeded on the 3rd attempt)

with_retry(1) { "immediate" }  # => "immediate", block called once

with_retry(2) { raise "always fails" }
# raises RuntimeError after 2 attempts
```
