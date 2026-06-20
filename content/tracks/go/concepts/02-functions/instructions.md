# Functions

## What you'll learn

Go functions can return multiple values — this is the idiomatic way to return both a result and an error.

## Key concepts

**Single return:**

```go
func double(n int) int {
    return n * 2
}
```

**Multiple returns** (result + error pattern):

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}
```

**Named returns** (optional, useful for documentation):

```go
func minMax(nums []int) (min, max int) { ... }
```

## The task

Implement two functions:

1. `Add(a, b int) int` — returns the sum
2. `Divide(a, b float64) (float64, error)` — returns the quotient, or an error with message `"cannot divide by zero"` if `b == 0`
