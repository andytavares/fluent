## What you build

You write `FizzBuzz(n int) string` with a `switch` that has no expression. Go has only three control words: `if`, `for` and `switch`. This lesson builds on **Functions**.

## Key concepts

### `if` has no parentheses

Do not put parentheses around the condition. The braces are mandatory.

```go
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}
```

### `for` is the only loop

Go has no `while` keyword. The `for` keyword has three forms.

```go
// Three clauses
for i := 0; i < 10; i++ { }

// One clause: a while loop
for condition { }

// No clauses: runs until break
for { }
```

### `switch` does not fall through

Each case stops at its end, so you do not write `break`. To continue into the next case, write `fallthrough` as the last statement of the case.

```go
switch day {
case "Mon", "Tue", "Wed", "Thu", "Fri":
    return "weekday"
case "Sat", "Sun":
    return "weekend"
}
```

### `switch` with no expression

A `switch` with no value tests each case as a condition. Go code uses it in place of a long `if`/`else if` chain.

```go
switch {
case n%15 == 0:
    return "FizzBuzz"
case n%3 == 0:
    return "Fizz"
default:
    return fmt.Sprintf("%d", n)
}
```

## Watch out

- Go runs the first case that is true. Put `n%15 == 0` first, or `FizzBuzz(15)` returns `"Fizz"`.
- `while` is a compile error, not a warning.
- `for i := range 10` needs Go 1.22 or later.
- A `switch` with no matching case and no `default` does nothing. It does not panic.

## The task

Write `FizzBuzz(n int) string`. It returns one word for one integer:

1. If `n` divides by 3 and by 5, return `"FizzBuzz"`.
2. If `n` divides by 3 only, return `"Fizz"`.
3. If `n` divides by 5 only, return `"Buzz"`.
4. Otherwise, return `n` as a decimal string. Use `fmt.Sprintf("%d", n)`.

Zero and negative numbers follow the same rules. Zero divides by every integer.

```go
FizzBuzz(1)    // "1"
FizzBuzz(3)    // "Fizz"
FizzBuzz(5)    // "Buzz"
FizzBuzz(15)   // "FizzBuzz"
FizzBuzz(30)   // "FizzBuzz"
FizzBuzz(7)    // "7"
FizzBuzz(0)    // "FizzBuzz"
FizzBuzz(-15)  // "FizzBuzz"
```
