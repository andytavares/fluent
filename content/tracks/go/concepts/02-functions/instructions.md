# Functions

## What you'll learn

Building on the types from lesson 1: Go functions declare every parameter and return type explicitly, and — unlike most languages you've used — a function can return **multiple values**. This isn't a tuple hack; it's how Go does the `(result, error)` pattern that replaces exceptions, which you'll rely on constantly from here on.

## Key concepts

**Single return:**

```go
func double(n int) int {
    return n * 2
}
```

**Multiple returns** (the `(result, error)` pattern):

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}

result, err := divide(10, 2)
if err != nil {
    // handle it
}
```

**Named returns** are declared in the signature and can be returned bare with `return`; useful for self-documenting multi-value returns:

```go
func minMax(nums []int) (min, max int) {
    min, max = nums[0], nums[0]
    for _, n := range nums[1:] {
        if n < min { min = n }
        if n > max { max = n }
    }
    return // returns the current values of min and max
}
```

**Multiple parameters of the same type** share one type annotation:

```go
func Add(a, b int) int { return a + b }   // same as (a int, b int)
```

## Watch out

- Go has **no function overloading** — you cannot declare `Add(a, b int)` and `Add(a, b float64)` in the same package. Different input types need different function names (or, later, generics).
- Go has **no default parameter values** and no named arguments. Every call site must supply every argument.
- The `error` return is a convention, not compiler-enforced — nothing stops you from ignoring it with `result, _ := divide(10, 0)`. The compiler will complain about an unused variable, but never about a silently discarded error.
- Returning `(0, nil)` when there's actually an error is a real bug pattern: callers check `err != nil` first, so if you forget to return a non-nil error, the zero-value result looks like a legitimate `0`.

## The task

Implement two functions that establish the multi-return pattern used throughout this track.

**`Add(a, b int) int`** — returns the sum of `a` and `b`.

```go
Add(2, 3)      // 5
Add(-1, 1)     // 0
Add(100, 200)  // 300
```

**`Divide(a, b float64) (float64, error)`** — returns `a / b` and a `nil` error. If `b == 0`, instead returns `0` and a non-nil error whose message is exactly `"cannot divide by zero"`.

```go
result, err := Divide(10, 2)
// result == 5.0, err == nil

result, err := Divide(10, 0)
// result == 0, err.Error() == "cannot divide by zero"

result, err := Divide(-9, 3)
// result == -3.0, err == nil
```
