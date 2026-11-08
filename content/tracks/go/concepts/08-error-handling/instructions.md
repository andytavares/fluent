## What you build

You write `ParseAge`, which parses a string and checks the age range. Go has no exceptions and no `try`/`catch`. A function returns an `error` value as its last result. This lesson builds on **Interfaces**.

## Key concepts

### Two ways to create an error

```go
import (
    "errors"
    "fmt"
)

err1 := errors.New("something went wrong")
err2 := fmt.Errorf("invalid value: %d", v)
```

### Check `err` after every call that can fail

`%w` wraps the original error inside the new one.

```go
result, err := riskyOp()
if err != nil {
    return fmt.Errorf("riskyOp: %w", err)
}
```

### Sentinel errors are values you compare

A sentinel error is a package-level error value. `errors.Is` finds it, even through wrapping.

```go
var ErrNotFound = errors.New("not found")

if errors.Is(err, ErrNotFound) {
    // handle this case
}
```

### `error` is an interface

Any type with an `Error() string` method satisfies it. Your own error types can carry structured data.

```go
type error interface {
    Error() string
}
```

## Watch out

- Check `err != nil` before you use the result. Otherwise you use a zero value that looks valid.
- Do not compare wrapped errors with `==`. Wrapping makes a new value. Use `errors.Is`, which walks the wrap chain.
- Only `%w` keeps the chain for `errors.Is` and `errors.As`. `%v` and `%s` lose it.
- Do not return a nil `*MyError` as an `error`. The interface value is not `nil`.
- When there is no error, return the literal `nil`.

## The task

Write `ParseAge(s string) (int, error)`. It parses a person's age and checks that it is in a human range.

1. Parse `s` with `strconv.Atoi(s)`.
2. If parsing fails, return `0` and a non-nil error. Any message that names the input works.
3. If the value is negative, return `0` and the error `"age cannot be negative"`.
4. If the value is greater than `150`, return `0` and the error `"age too large: max is 150"`.
5. Otherwise, return the age and `nil`.

`0` and `150` are valid ages. An empty string is not a valid integer.

```go
ParseAge("25")  // 25, nil
ParseAge("0")   // 0, nil
ParseAge("150") // 150, nil
// 0, "age cannot be negative"
ParseAge("-1")
// 0, "age too large: max is 150"
ParseAge("151")
ParseAge("abc") // 0, non-nil error
ParseAge("")    // 0, non-nil error
```
