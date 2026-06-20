# Variables & Types

## What you'll learn

Go is statically typed with type inference. You declare variables with `:=` (short form, inside functions) or `var` (package level or explicit type). Once declared, the type never changes.

## Key concepts

**Short declaration** (most common):

```go
name := "Alice"   // string inferred
age  := 30        // int inferred
```

**Explicit var** (useful when you want the zero value or a specific type):

```go
var score int        // zero value: 0
var active bool      // zero value: false
var label string     // zero value: ""
```

**Constants** never change at runtime:

```go
const MaxRetries = 3
const Pi = 3.14159
```

**Basic types:** `int`, `float64`, `string`, `bool`

## The task

Implement the function `Describe(name string, age int, score float64) string` that returns a string in exactly this format:

```
name=Alice age=30 score=95.50
```

Use `fmt.Sprintf` with `%.2f` for the float. Also set the package-level constant `Version = "1.0.0"`.
