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

## Watch out

- `->(n) { n * 2 }.lambda?` returns `true`; `Proc.new { |n| n * 2 }.lambda?` returns `false` — use `.lambda?` when you need to check which kind of callable you have.
- A memoizing cache keyed on argument must distinguish "never computed" from "computed and the result was `nil`/`false`". Use `cache.key?(arg)` to check presence, not `cache[arg].nil?` — the latter recomputes forever for any argument whose legitimate result is `nil` or `false`.
- `callable.call(x)` on a lambda enforces arity strictly — passing a lambda of the wrong arity into `apply_twice` or `compose` raises `ArgumentError`, whereas a `Proc` would silently pad missing arguments with `nil`.
- Closures capture the **variable**, not a snapshot: `make_multiplier(3)` closes over `factor`, but if a later reassignment mutated `factor` in the same scope, every lambda created from it would see the new value too (this doesn't apply here since `factor` is a method parameter local to each call).

## The task

Implement four higher-order functions built on lambdas.

**`make_multiplier(factor)`** — returns a lambda that takes one number and multiplies it by `factor`.

```ruby
triple = make_multiplier(3)
triple.call(4)   # => 12
triple.call(0)   # => 0
triple.call(-2)  # => -6
triple.lambda?   # => true
```

**`apply_twice(value, callable)`** — calls `callable` on `value`, then calls `callable` again on that result, and returns the final value.

```ruby
apply_twice(2, ->(n) { n * 3 })     # => 18   (2 -> 6 -> 18)
apply_twice(4, ->(n) { n + 1 })     # => 6    (4 -> 5 -> 6)
apply_twice("a", ->(s) { s * 2 })   # => "aaaa"
```

**`compose(f, g)`** — returns a new lambda that, given `x`, computes `f.call(g.call(x))` — i.e. applies `g` first, then `f`.

```ruby
add1   = ->(n) { n + 1 }
double = ->(n) { n * 2 }

compose(double, add1).call(5)  # => 12   double(add1(5)) = double(6) = 12
compose(add1, double).call(5)  # => 11   add1(double(5)) = add1(10) = 11
```

**`memoize(callable)`** — returns a lambda that caches results by argument. The first call with a given argument invokes `callable` and stores the result; subsequent calls with that same argument return the cached value **without** invoking `callable` again.

```ruby
calls = 0
expensive = ->(n) { calls += 1; n ** 2 }
cached = memoize(expensive)

cached.call(4)  # => 16 — computed, calls == 1
cached.call(4)  # => 16 — cached, calls still == 1
cached.call(3)  # => 9  — new argument, calls == 2
```
