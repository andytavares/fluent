## What you build

You write four small functions that use read-only bindings, nullable types, string templates and explicit number conversions. Kotlin checks nullability at compile time, as part of the type.

## Key concepts

### `val` is read-only, `var` can change

A `val` binding cannot get a new value. A `var` binding can. Use `val` by default; the compiler tells you when you need `var`.

```kotlin
// Explicit type
val name: String = "Ada"
// Inferred as Int
val age = 30
var score = 0
// OK: score is a var
score += 10
```

### Kotlin has no primitive types in the language

`Int`, `Double`, `Boolean` and `Char` are regular classes. The compiler emits JVM primitives where it can, so you never choose between `int` and `Integer`.

| Kotlin | JVM bytecode |
|--------|-------------|
| `Int`  | `int` / `Integer` |
| `Double` | `double` / `Double` |
| `Boolean` | `boolean` / `Boolean` |
| `String` | `String` |
| `Unit` | `void`, but `Unit` is a real type with one value |
| `Any` | `Object` |
| `Nothing` | No values. It is the return type of a function that never returns. |

### A type allows `null` only with `?`

Every type is non-nullable by default. Add `?` to allow `null`. Java's `@Nullable` is only an annotation, but Kotlin's compiler enforces `?`.

```kotlin
val a: String = "hello"
// OK
val b: String? = null
// Compile error
val c: String = null
```

Three operators handle a nullable value:

```kotlin
// null if b is null
val len: Int? = b?.length
// Elvis: 0 if b is null
val len2: Int = b?.length ?: 0
// Throws NullPointerException if b is
// null. Avoid it in production code.
val len3: Int = b!!.length
```

### String templates insert values

Write `$name` for a variable and `${...}` for any expression.

```kotlin
val city = "Tokyo"
// Hello from Tokyo!
println("Hello from $city!")
println("Length: ${name.length}")
```

### Number conversions are explicit

Kotlin does not widen numbers for you. Call a conversion function such as `toLong()` or `toDouble()`.

```kotlin
val x: Int = 42
val y: Long = x.toLong()
val z: Double = x.toDouble()
```

## Watch out

- `val` stops reassignment, not mutation. `val list = mutableListOf(1, 2)` still lets you call `list.add(3)`.
- Kotlin has no implicit widening. Assigning an `Int` variable to a `Long` is a compile error. Call `toLong()`.
- `isNullOrBlank()` treats a whitespace-only string as empty. `isEmpty()` does not.

## The task

Write four top-level functions in `stub.kt`.

1. `celsiusToFahrenheit(celsius: Double): Double` returns `(celsius * 9.0 / 5.0) + 32.0`.
2. `greet(name: String?): String` returns `"Hello, <name>!"`. If `name` is null, empty or blank, it returns `"Hello, stranger!"`.
3. `describeNumber(n: Int): String` returns `"positive"`, `"negative"` or `"zero"`.
4. `initials(fullName: String): String` returns the first letter of each word, each one followed by a dot.

For `initials`, one space separates the words. The input is never empty. A single word gives one initial.

```kotlin
celsiusToFahrenheit(0.0)   // 32.0
celsiusToFahrenheit(100.0) // 212.0
celsiusToFahrenheit(-40.0) // -40.0
greet("Ada")      // "Hello, Ada!"
greet(null)       // "Hello, stranger!"
greet("  ")       // "Hello, stranger!"
describeNumber(5)  // "positive"
describeNumber(-1) // "negative"
describeNumber(0)  // "zero"
initials("Ada Lovelace") // "A.L."
initials("Kotlin")       // "K."
```
