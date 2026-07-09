# Error Handling

## What you'll learn

Go has no exceptions and no `try`/`catch`. Building on the multi-return pattern from lesson 2, functions signal failure by returning a plain value of the built-in `error` interface as their **last** return value — errors are ordinary values you check, wrap, and pass around, not a separate control-flow channel.

## Key concepts

**Creating errors** two ways:

```go
import "errors"
import "fmt"

err1 := errors.New("something went wrong")
err2 := fmt.Errorf("invalid value: %d", val)
```

**The nil check pattern** — check immediately after every fallible call:

```go
result, err := riskyOp()
if err != nil {
    return fmt.Errorf("riskyOp failed: %w", err)  // %w wraps the original error
}
```

**Sentinel errors** — package-level values you can compare against, even through wrapping:

```go
var ErrNotFound = errors.New("not found")

if errors.Is(err, ErrNotFound) {
    // handle specifically
}
```

**`error` is just an interface**:

```go
type error interface {
    Error() string
}
```

Any type with an `Error() string` method satisfies it — including your own custom error types for structured error data.

## Watch out

- **`err != nil` must come before you use the result.** A function returning `(0, err)` on failure means the `0` is a valid-looking zero value — if you skip the check, you silently proceed with garbage.
- **Never compare wrapped errors with `==`.** `fmt.Errorf("...: %w", ErrNotFound) == ErrNotFound` is `false` — wrapping produces a new error value. Use `errors.Is` (checks the whole wrap chain) instead.
- `%w` (wrap) vs `%v`/`%s` (format only) matters: only `%w` preserves the chain that `errors.Is`/`errors.As` can walk. Using `%v` to embed an error loses that ability.
- Returning a *typed* nil error is a classic footgun: if you declare `var err *MyError` (nil) and return it as the `error` interface, the interface value is **not `nil`** (same root cause as the nil-interface gotcha from the interfaces lesson) — always return the literal `nil`, not a nil-valued concrete-typed variable, when there's no error.

## The task

Implement `ParseAge(s string) (int, error)` that parses a string as a person's age and validates it's in a sane human range.

- Parse `s` as an integer using `strconv.Atoi(s)`. If parsing fails, return `0` and a non-nil error (any message referencing the invalid input is fine).
- If the parsed value is negative, return `0` and an error with message exactly `"age cannot be negative"`.
- If the parsed value is greater than `150`, return `0` and an error with message exactly `"age too large: max is 150"`.
- Otherwise, return the parsed age and `nil`.

```go
ParseAge("25")   // 25, nil
ParseAge("0")    // 0, nil
ParseAge("150")  // 150, nil     — 150 is the inclusive maximum
ParseAge("-1")   // 0, error: "age cannot be negative"
ParseAge("151")  // 0, error: "age too large: max is 150"
ParseAge("abc")  // 0, non-nil error (invalid integer)
ParseAge("")     // 0, non-nil error (invalid integer)
```
