# Variables & Types

## What you'll learn

Go is statically typed with type inference: the compiler figures out a variable's type from its initializer, but once set, the type never changes and there's no implicit widening or narrowing later. You'll learn the two ways to declare variables, how zero values remove the concept of "uninitialized", and how `fmt.Sprintf` verbs format values — the formatting mini-language you'll use in almost every lesson that follows.

## Key concepts

**Short declaration** (`:=`, most common, only valid inside functions):

```go
name := "Alice"   // string inferred
age  := 30        // int inferred
```

**Explicit `var`** (needed at package level, or when you want the zero value):

```go
var score int        // zero value: 0
var active bool      // zero value: false
var label string      // zero value: ""
var total float64     // zero value: 0.0
```

Every type has a zero value — there is no `null`/`nil`/`undefined` for `int`, `string`, `bool`, or `float64`. A freshly declared variable is always usable immediately.

**Constants** are computed at compile time and never change:

```go
const MaxRetries = 3
const Pi = 3.14159
```

**Type conversion is always explicit** — Go never silently converts between numeric types:

```go
var i int = 42
var f float64 = float64(i)   // must convert explicitly
var u uint = uint(f)         // same for any numeric pair
```

**`fmt.Sprintf` verbs** you'll use constantly:

| Verb | Meaning | Example |
|------|---------|---------|
| `%s` | string | `"Alice"` |
| `%d` | integer | `30` |
| `%f` / `%.2f` | float, `.2f` rounds to 2 decimals | `95.50` |
| `%v` | default format for any value | works for anything |
| `%q` | quoted string | `"Alice"` with quotes |

## Watch out

- `int` overflow wraps silently instead of panicking — `int8(127) + 1` becomes `-128`. Go never raises an overflow error.
- Mixing numeric types in one expression is a **compile error**, not a runtime one: `var x int = 1; var y float64 = 2.0; x + y` fails to compile. You must convert one side.
- `%.2f` **rounds**, it doesn't truncate: `fmt.Sprintf("%.2f", 95.505)` can print `95.50` or `95.51` depending on float64's binary representation of the value — don't assume decimal-exact rounding.
- `const` values without a type (like `const Pi = 3.14159`) are "untyped constants" — they adapt to whatever context uses them (an `int` context, a `float64` context, etc.) until assigned to a typed variable.

## The task

Implement the function `Describe(name string, age int, score float64) string` that formats a person's stats into one line, and declare a package-level constant `Version`.

**`Describe(name string, age int, score float64) string`** — returns a string in exactly this format, with the score always shown to 2 decimal places:

```
name=<name> age=<age> score=<score, 2 decimals>
```

```go
Describe("Alice", 30, 95.5)   // "name=Alice age=30 score=95.50"
Describe("Bob", 25, 100.0)    // "name=Bob age=25 score=100.00"
Describe("Carol", 0, 0.0)     // "name=Carol age=0 score=0.00"
Describe("Dee", -1, 12.345)   // "name=Dee age=-1 score=12.35" — rounds to 2 places
```

Use `fmt.Sprintf` with the `%s`, `%d`, and `%.2f` verbs.

**`Version`** — a package-level constant string. Set it to any non-empty semantic version string, e.g. `"1.0.0"`.
