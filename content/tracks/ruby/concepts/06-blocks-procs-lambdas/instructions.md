# Blocks, Procs & Lambdas

## What you'll learn

The three callable objects in Ruby — blocks, Procs, and lambdas — what makes each different, and how closures capture their enclosing scope.

## Key concepts

### Proc vs Lambda — two critical differences

Both are instances of `Proc`. Lambda is a special kind of Proc. The differences matter in two places:

**1. Arity checking**

```ruby
lam  = lambda { |x, y| x + y }
prc  = Proc.new { |x, y| x.to_i + y.to_i }

lam.call(1, 2)    # => 3
lam.call(1)       # ArgumentError — wrong number of arguments

prc.call(1, 2)    # => 3
prc.call(1)       # => 1  (missing y becomes nil, nil.to_i == 0)
prc.call(1, 2, 3) # => 3  (extra args silently dropped)
```

**2. Return behavior**

`return` inside a lambda returns from the lambda. `return` inside a Proc returns from the **enclosing method**.

```ruby
def lambda_return
  l = -> { return 10 }
  l.call
  "after lambda"   # reached
end

def proc_return
  p = Proc.new { return 10 }
  p.call
  "after proc"     # never reached — return exits the method
end

lambda_return  # => "after lambda"
proc_return    # => 10
```

### Lambda syntax

```ruby
# Stabby lambda (preferred)
double = ->(n) { n * 2 }
add    = ->(a, b) { a + b }

double.call(5)  # => 10
double.(5)      # => 10  (syntactic sugar)
double[5]       # => 10  (also valid)

# Method object
[1, 2, 3].map(&method(:puts))  # prints each, returns [nil, nil, nil]
```

### Closures capture the binding

A Proc or lambda closes over the local variables in scope when it was created. It sees changes to those variables, and changes it makes are visible outside.

```ruby
count = 0
increment = -> { count += 1 }

increment.call
increment.call
count  # => 2
```

This is the same closure semantics as JavaScript or Python — capture by reference, not by value.

### &method(:name) — converting methods to blocks

Use `method(:name)` to get a Method object, then `&` to pass it as a block:

```ruby
def square(n) = n ** 2

[1, 2, 3].map(&method(:square))  # => [1, 4, 9]
```

This is cleaner than `{ |n| square(n) }` when the function does exactly what the block would do.

### Composing callables

Ruby 2.6+ added `>>` and `<<` for composing Procs and lambdas:

```ruby
double  = ->(n) { n * 2 }
add_one = ->(n) { n + 1 }

double_then_add = double >> add_one  # first double, then add_one
double_then_add.call(3)  # => 7

add_then_double = double << add_one  # first add_one, then double
add_then_double.call(3)  # => 8
```

## vs other languages

| | Ruby | JavaScript | Python | Go |
|---|---|---|---|---|
| Anonymous function | Block / Lambda / Proc | Arrow function / function | lambda / def | func literal |
| Closure semantics | Capture by reference | Capture by reference | Capture by reference (cells) | Capture by reference |
| Arity enforcement | Lambda: strict; Proc: lenient | No — extra args ignored | Strict (`TypeError`) | Strict (compile error) |
| `return` in closure | Lambda: local; Proc: from enclosing method | Local only | Local only | Local only |
| Callable types | 3 (Block, Proc, Lambda) | 1 (Function) | 2 (function, lambda) | 1 (function) |

The Proc `return` behavior is a real footgun. A Proc that contains `return` passed to a method that `yield`s to it will exit **that method**, not the Proc. This surprises everyone coming from JavaScript or Python.

## The task

```ruby
def make_multiplier(factor)
  # Return a lambda that multiplies its argument by factor
end

def apply_twice(value, callable)
  # Call callable on value, then call callable on the result. Return the final value.
end

def compose(f, g)
  # Return a lambda that applies g first, then f (i.e. f(g(x)))
end

def memoize(callable)
  # Return a lambda that caches results by argument.
  # On first call with a given arg, compute via callable and store.
  # On subsequent calls with the same arg, return cached result.
end
```
