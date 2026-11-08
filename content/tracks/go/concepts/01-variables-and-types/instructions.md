## What you build

You write `Describe`, which formats three values into one line with `fmt.Sprintf`, and a package-level constant `Version`. Go checks types at compile time. The compiler infers a type from the initial value, and the type never changes after that.

## Key concepts

### `:=` declares and infers the type

The short declaration is the most common form. You can use it only inside a function.

```go
name := "Alice" // string
age := 30       // int
```

### `var` gives the zero value

Use `var` at package level, or when you want the zero value. Every type has a zero value, so a new variable is always ready to use. `int`, `string`, `bool` and `float64` have no `nil`.

```go
var score int     // 0
var active bool   // false
var label string  // ""
var total float64 // 0
```

### A constant never changes

The compiler computes a `const` value, and the value never changes.

```go
const MaxRetries = 3
const Pi = 3.14159
```

### Constants with no type adapt to their context

`const Pi = 3.14159` is an untyped constant. It takes the type that its context needs, `int` or `float64`, until you assign it to a typed variable.

### Every type conversion is explicit

Go never converts between numeric types for you. Write the target type as a function.

```go
var i int = 42
var f float64 = float64(i)
var u uint = uint(f)
```

### `fmt.Sprintf` formats with verbs

| Verb | Meaning | Example |
|------|---------|---------|
| `%s` | string | `Alice` |
| `%d` | integer | `30` |
| `%f` / `%.2f` | float; `.2` rounds to 2 decimals | `95.50` |
| `%v` | default format for any value | any value |
| `%q` | quoted string | `"Alice"` |

```go
fmt.Sprintf("%s is %d", "Bob", 25)
// "Bob is 25"
```

## Watch out

- Integer overflow at run time wraps and does not panic. An `int8` variable at 127 plus 1 becomes -128.
- A constant expression that overflows, such as `int8(127) + 1`, is a compile error.
- Two numeric types in one expression is a compile error. `x + y` fails for an `int` and a `float64`. Convert one side.
- `%.2f` rounds the binary value, not the decimal you typed. `95.505` prints `95.50`, because float64 stores it slightly below 95.505.

## The task

Write a function that formats a person's stats into one line. Also declare a package-level constant.

1. `Describe(name string, age int, score float64) string` returns `name=<name> age=<age> score=<score>`.
2. Show the score with exactly 2 decimal places. Round it, do not truncate it.
3. Use `fmt.Sprintf` with the `%s`, `%d` and `%.2f` verbs.
4. `Version` is a package-level `const` string. It must not be empty, for example `"1.0.0"`.

Zero and negative ages use the same format.

```go
Describe("Alice", 30, 95.5)
// "name=Alice age=30 score=95.50"
Describe("Bob", 25, 100.0)
// "name=Bob age=25 score=100.00"
Describe("Carol", 0, 0.0)
// "name=Carol age=0 score=0.00"
Describe("Dee", -1, 12.345)
// "name=Dee age=-1 score=12.35"
```
