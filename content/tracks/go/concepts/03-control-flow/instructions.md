# Control Flow

## What you'll learn

Go collapses the usual `if`/`while`/`for`/`do-while` zoo into just `if`, `for`, and `switch` — `for` alone covers every kind of loop you've written in other languages. You'll learn all three `for` forms and why `switch` in Go doesn't fall through by default, which is the opposite of C, Java, and JavaScript.

## Key concepts

**if/else** — no parentheses around the condition, braces are mandatory:

```go
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}
```

**for** has three forms, all using the same keyword:

```go
for i := 0; i < 10; i++ { }   // C-style, three clauses
for condition { }              // while-style, one clause
for { }                        // infinite loop, no clauses (break to exit)
```

**switch** — cases don't fall through by default (each case implicitly breaks):

```go
switch day {
case "Mon", "Tue", "Wed", "Thu", "Fri":
    return "weekday"
case "Sat", "Sun":
    return "weekend"
}
```

**switch with no expression** works like a cleaner if/else-if chain — this is the idiom for multi-way branching on conditions rather than equality:

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

- Coming from C/Java/JS: Go `switch` cases **do not fall through**. If you actually want fallthrough behavior, you must write the `fallthrough` keyword explicitly as the last statement in a case.
- There's no `while` keyword — `for condition { }` is the idiomatic while-loop. Writing `while` is a compile error, not a warning.
- `for i := range someInt` (ranging directly over an integer) only works in Go 1.22+; on Go 1.21 and earlier you must range over a slice, `for i := 0; i < n; i++`, or similar.
- A `switch` with no `case` matches falls through to nothing unless there's a `default` — there's no implicit error or panic.

## The task

Implement `FizzBuzz(n int) string`, the classic FizzBuzz check for a single integer `n`:

- If `n` is divisible by both 3 and 5, return `"FizzBuzz"`.
- Else if `n` is divisible by 3, return `"Fizz"`.
- Else if `n` is divisible by 5, return `"Buzz"`.
- Otherwise, return `n` formatted as a plain decimal string (use `fmt.Sprintf("%d", n)`).

```go
FizzBuzz(1)    // "1"
FizzBuzz(3)    // "Fizz"
FizzBuzz(5)    // "Buzz"
FizzBuzz(15)   // "FizzBuzz"
FizzBuzz(30)   // "FizzBuzz"
FizzBuzz(7)    // "7"
FizzBuzz(0)    // "FizzBuzz" — 0 is divisible by every integer (0 % 3 == 0 and 0 % 5 == 0)
FizzBuzz(-15)  // "FizzBuzz" — divisibility rules apply to negative numbers too
```
