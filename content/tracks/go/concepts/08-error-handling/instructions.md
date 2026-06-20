# Error Handling

## What you'll learn

Go errors are values — there are no exceptions. Functions signal failure by returning an `error` as their last return value.

## Key concepts

**Creating errors:**

```go
import "errors"
import "fmt"

err1 := errors.New("something went wrong")
err2 := fmt.Errorf("invalid value: %d", val)
```

**The nil check pattern:**

```go
result, err := riskyOp()
if err != nil {
    return fmt.Errorf("riskyOp failed: %w", err)  // %w wraps the error
}
```

**Sentinel errors** (check for specific errors):

```go
var ErrNotFound = errors.New("not found")

if errors.Is(err, ErrNotFound) { ... }
```

## The task

Implement `ParseAge(s string) (int, error)`:
- Parse `s` as an integer using `strconv.Atoi`
- Return an error `"age cannot be negative"` if age < 0
- Return an error `"age too large: max is 150"` if age > 150
- Otherwise return the parsed age and `nil`
