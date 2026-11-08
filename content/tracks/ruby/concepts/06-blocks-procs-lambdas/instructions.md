## What you build

You write four higher-order functions that return and combine lambdas, including a cache that runs each argument once. This lesson builds on **Enumerables**.

## Key concepts

### A lambda is a strict kind of `Proc`

Ruby has three callables: blocks, procs and lambdas. Procs and lambdas are both `Proc` objects. They differ in arity checks and in what `return` does.

```ruby
->(n) { n * 2 }.lambda?          # => true
Proc.new { |n| n * 2 }.lambda?   # => false
```

### A lambda checks its arity, a proc does not

A lambda raises `ArgumentError` on the wrong number of arguments. A proc sets missing arguments to `nil` and drops extra ones.

```ruby
lam = lambda { |x, y| x + y }
prc = Proc.new { |x, y| x.to_i + y.to_i }

lam.call(1, 2)     # => 3
lam.call(1)        # ArgumentError

prc.call(1, 2)     # => 3
# y is nil, and nil.to_i is 0:
prc.call(1)        # => 1
prc.call(1, 2, 3)  # => 3
```

### `return` in a proc leaves the enclosing method

`return` in a lambda returns from the lambda. `return` in a proc returns from the method that defined it. JavaScript and Python have only the local form.

```ruby
def lambda_return
  l = -> { return 10 }
  l.call
  "after lambda"
end

def proc_return
  p = Proc.new { return 10 }
  p.call
  # Never reached:
  "after proc"
end

lambda_return  # => "after lambda"
proc_return    # => 10
```

### The stabby lambda is the usual syntax

You can call a lambda in three ways.

```ruby
double = ->(n) { n * 2 }
add = ->(a, b) { a + b }

double.call(5)  # => 10
double.(5)      # => 10
double[5]       # => 10
```

### A closure captures variables, not values

A proc or lambda closes over the local variables in scope when you create it. It sees later changes to them, and its own changes are visible outside. JavaScript and Python closures work the same way.

```ruby
count = 0
increment = -> { count += 1 }

increment.call
increment.call
count  # => 2
```

### `&method(:name)` passes a method as a block

`method(:name)` returns a `Method` object, and `&` passes it as the block. It is cleaner than `{ |n| square(n) }`.

```ruby
def square(n) = n ** 2

[1, 2, 3].map(&method(:square))
# => [1, 4, 9]

# Prints each, returns [nil, nil, nil]
[1, 2, 3].map(&method(:puts))
```

### `>>` and `<<` compose callables

Ruby 2.6 added `>>` and `<<` to procs and lambdas. `f >> g` runs `f` first. `f << g` runs `g` first.

```ruby
double = ->(n) { n * 2 }
add_one = ->(n) { n + 1 }

(double >> add_one).call(3)  # => 7
(double << add_one).call(3)  # => 8
```

## Watch out

- A proc with `return`, passed to a method that yields to it, exits that method.
- Use `.lambda?` to find out which kind of callable you have.
- `cache[arg].nil?` recomputes forever when the result is `nil` or `false`. Use `cache.key?(arg)` for a memoizing cache.
- A lambda of the wrong arity raises `ArgumentError`. A proc pads missing arguments with `nil` instead.
- A closure captures the variable, not a snapshot. A later reassignment in the same scope changes what it sees.
- A method parameter such as `factor` is local to each call, so each returned lambda has its own.

## The task

Write four higher-order functions in `stub.rb`. Each one takes or returns a lambda.

1. `make_multiplier(factor)` returns a lambda that takes one number and multiplies it by `factor`.
2. `apply_twice(value, callable)` calls `callable` on `value`, then on that result. It returns the final value.
3. `compose(f, g)` returns a new lambda. Given `x`, it returns `f.call(g.call(x))`, so `g` runs first.
4. `memoize(callable)` returns a lambda that caches results by argument.
5. The first call with an argument runs `callable` and stores the result.
6. A later call with the same argument returns the stored result and does not run `callable`.

```ruby
triple = make_multiplier(3)
triple.call(4)   # => 12
triple.call(0)   # => 0
triple.call(-2)  # => -6
triple.lambda?   # => true
make_multiplier(2).call(5)  # => 10

apply_twice(2, ->(n) { n * 3 })    # => 18
apply_twice(4, ->(n) { n + 1 })    # => 6
apply_twice("a", ->(s) { s * 2 })
# => "aaaa"

add1 = ->(n) { n + 1 }
double = ->(n) { n * 2 }
compose(double, add1).call(5)  # => 12
compose(double, add1).call(0)  # => 2
compose(add1, double).call(5)  # => 11

calls = 0
slow = ->(n) { calls += 1; n ** 2 }
cached = memoize(slow)
cached.call(4)  # => 16, calls is 1
cached.call(4)  # => 16, calls is 1
cached.call(3)  # => 9, calls is 2
cached.call(3)  # => 9, calls is 2
```
