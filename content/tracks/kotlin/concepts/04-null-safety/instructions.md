## What you build

You write four functions that take nullable values and return safe defaults. Kotlin encodes nullability in the type: a `String` is never null, and a `String?` can be. This lesson builds on **Classes & Data Classes**.

## Key concepts

### The compiler rejects a call on a nullable value

You cannot read a member of a `String?` directly. You must handle `null` first.

```kotlin
val a: String = "hello"
val b: String? = null

a.length   // OK
// Compile error: b can be null
b.length
```

### The safe call `?.` returns `null` for a null receiver

`?.` does not throw. Chain it for nested access.

```kotlin
// null if b is null
val len: Int? = b?.length
val city: String? =
    user?.address?.city
```

### The Elvis operator `?:` gives a default

`?:` returns the right side when the left side is null.

```kotlin
val len: Int = b?.length ?: 0
val label = name ?: "Unknown"
```

### The not-null assertion `!!` throws on null

`!!` turns a nullable type into a non-nullable type. It throws `NullPointerException` at runtime if the value is null. Every `!!` is a bet that you know more than the type system.

```kotlin
// NullPointerException if b is null
val len = b!!.length
```

### A null check is a smart cast

After you check for null, the compiler treats the value as non-nullable.

```kotlin
if (b != null) {
    // b is a String here, not String?
    println(b.length)
}
```

### Scope functions run a block on a value

The five scope functions differ in how the block sees the value and in what they return. They are not specific to null, but they combine with `?.`.

| Function | Value as | Returns |
|----------|-------------|---------|
| `let` | `it` | block result |
| `run` | `this` | block result |
| `also` | `it` | the value |
| `apply` | `this` | the value |
| `with` | `this` | block result, not an extension |

The most common null-safe pattern is `?.let`. Use `apply` to set up an object.

```kotlin
val name: String? = getName()
// null if name is null
val upper = name?.let { it.uppercase() }

val list = mutableListOf<String>().apply {
    add("a")
    add("b")
}
```

Swift has the closest null model, with `T?`, `?.`, `??` and `!`.

## Watch out

- `!!` throws `NullPointerException`, the one exception the type system exists to prevent. Ask why the type does not already prove the value is non-null.
- Smart casts work on `val` values and on local `var` values that do not change between the check and the use.
- A smart cast fails on a `var` property of another class. Other code can set it to null after the check.
- `a ?: expensiveDefault()` calls `expensiveDefault()` only when `a` is null. Elvis short-circuits.

## The task

You write helpers that pick a usable value from inputs that can be null. A blank string has only whitespace characters, or no characters. Write four top-level functions in `stub.kt`:

1. `firstNonNull(vararg values: String?): String?` returns the first value that is not null and not blank.
2. If no value qualifies, `firstNonNull` returns `null`.
3. `safeDivide(a: Int, b: Int): Double?` returns `a.toDouble() / b`. If `b` is zero, it returns `null`.
4. `parsePositiveInt(s: String?): Int?` parses `s` as an integer and returns it if it is greater than 0.
5. `parsePositiveInt` returns `null` for null input, for text that is not a number, and for 0 or less.
6. `coalesce(primary: String?, secondary: String?, fallback: String): String` returns the first of its arguments that is not null and not blank.
7. `fallback` is never null. `coalesce` returns it when the other two do not qualify.

```kotlin
firstNonNull(null, "", "hello") // "hello"
firstNonNull("a", "b")          // "a"
firstNonNull("", "  ")          // null
safeDivide(10, 2)   // 5.0
safeDivide(1, 2)    // 0.5
safeDivide(10, 0)   // null
parsePositiveInt("42")   // 42
parsePositiveInt(null)   // null
parsePositiveInt("abc")  // null
parsePositiveInt("0")    // null
parsePositiveInt("-1")   // null
coalesce("a", "b", "c")      // "a"
coalesce("  ", "b", "c")     // "b"
coalesce(null, null, "c")    // "c"
```
