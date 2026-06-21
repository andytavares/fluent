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

## The task

```ruby
class ValidationError < StandardError
  # Custom exception. initialize(field, message) should call super with
  # "#{field}: #{message}" and expose a `field` attr_reader.
end

def parse_positive_integer(str)
  # Parse str as an integer. Raise ArgumentError if str is not a valid integer.
  # Raise RangeError if the parsed integer is <= 0.
  # Return the integer on success.
end

def with_retry(max_attempts, &block)
  # Call block. If it raises StandardError, retry up to max_attempts total.
  # After max_attempts, re-raise the last exception.
  # Return the block's return value on success.
end
```
