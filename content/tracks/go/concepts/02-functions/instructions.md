## What you build

You write `Add`, which returns one value, and `Divide`, which returns a result and an error. Go uses the `(result, error)` pair in place of exceptions, and the rest of this track uses it. This lesson builds on **Variables & Types**.

## Key concepts

### Every parameter and return has a type

Go declares the type of each parameter and of the return value.

```go
func double(n int) int {
    return n * 2
}
```

### Parameters of one type share the type

Write the type once after the last parameter of that type.

```go
// Same as (a int, b int)
func Add(a, b int) int { return a + b }
```

### A function can return more than one value

Multiple return values are part of the language, not a tuple. The `(result, error)` pattern uses them. The caller checks `err` first.

```go
func div(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("b is zero")
    }
    return a / b, nil
}

result, err := div(10, 2)
if err != nil {
    // handle the error
}
```

### Named returns document the values

You can name the return values in the signature. A bare `return` then returns their current values.

```go
func minMax(nums []int) (min, max int) {
    min, max = nums[0], nums[0]
    for _, n := range nums[1:] {
        if n < min { min = n }
        if n > max { max = n }
    }
    return
}
```

## Watch out

- Go has no function overloading. `Add(a, b int)` and `Add(a, b float64)` cannot share one package. Use two names, or generics later.
- Go has no default parameter values and no named arguments. Every call supplies every argument.
- The compiler does not force you to check an error. `result, _ := div(10, 0)` compiles and drops the error.
- The compiler rejects an unused variable, but it never rejects a discarded error.
- Returning `(0, nil)` on a failure is a bug. The caller sees no error and takes `0` as a real result.

## The task

Write two functions that use the multiple-return pattern of this track.

1. `Add(a, b int) int` returns the sum of `a` and `b`.
2. `Divide(a, b float64) (float64, error)` returns `a / b` and a `nil` error.
3. If `b` is `0`, `Divide` returns `0` and a non-nil error.
4. That error message is exactly `"cannot divide by zero"`.

Negative numbers follow the normal rules for both functions.

```go
Add(2, 3)     // 5
Add(0, 0)     // 0
Add(-1, 1)    // 0
Add(100, 200) // 300

Divide(10, 2)
// 5, nil
Divide(-9, 3)
// -3, nil
Divide(10, 0)
// 0, "cannot divide by zero"
```
