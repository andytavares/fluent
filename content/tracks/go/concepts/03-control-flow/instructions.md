# Control Flow

## What you'll learn

Go has three control structures: `if`, `for`, and `switch`. There is no `while` — `for` covers all looping.

## Key concepts

**if/else** (no parentheses around condition):

```go
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}
```

**for** (three forms):

```go
for i := 0; i < 10; i++ { }       // C-style
for condition { }                   // while-style
for { }                             // infinite loop
```

**switch** (no fallthrough by default):

```go
switch day {
case "Mon", "Tue", "Wed", "Thu", "Fri":
    return "weekday"
case "Sat", "Sun":
    return "weekend"
}
```

## The task

Implement `FizzBuzz(n int) string`:
- Return `"FizzBuzz"` if n is divisible by both 3 and 5
- Return `"Fizz"` if divisible by 3
- Return `"Buzz"` if divisible by 5
- Otherwise return the number as a string (use `fmt.Sprintf("%d", n)`)
