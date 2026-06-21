# Null Safety

## What you'll learn

Kotlin's type system encodes nullability at compile time — `String` is never null, `String?` might be. This concept covers the operators and scope functions that make working with nullable types ergonomic.

## Key concepts

**The nullable type distinction**

```kotlin
val a: String = "hello"    // guaranteed non-null
val b: String? = null      // explicitly nullable

a.length    // safe, always works
b.length    // compile error: b might be null
```

**Safe call `?.`**

Returns `null` instead of throwing when the receiver is null:

```kotlin
val len: Int? = b?.length      // null if b is null, otherwise b.length
```

Chain safe calls for nested access:

```kotlin
val city: String? = user?.address?.city
```

**Elvis operator `?:`**

Provides a default when the left side is null:

```kotlin
val len: Int = b?.length ?: 0        // 0 if b is null
val label = name ?: "Unknown"
```

**Not-null assertion `!!`**

Forces a nullable type to non-nullable. Throws `NullPointerException` at runtime if the value is null. Treat `!!` as a code smell — it means you know something the type system doesn't, and you're betting your app on it:

```kotlin
val len = b!!.length    // NPE if b is null
```

**Smart casts**

After a null check, the compiler narrows the type automatically:

```kotlin
if (b != null) {
    println(b.length)   // b is String here, not String?
}
```

**Scope functions**

The scope functions run a lambda with the nullable value as context. They differ in what `this`/`it` refers to and what they return:

| Function | Receiver as | Returns |
|----------|-------------|---------|
| `let` | `it` | lambda result |
| `run` | `this` | lambda result |
| `also` | `it` | receiver |
| `apply` | `this` | receiver |
| `with` | `this` | lambda result (not an extension) |

The most common null-safety pattern uses `let`:

```kotlin
val name: String? = getName()
val upper = name?.let { it.uppercase() }   // null if name is null, else uppercased
```

`apply` is idiomatic for object initialization:

```kotlin
val list = mutableListOf<String>().apply {
    add("a")
    add("b")
}
```

## vs other languages

| Language | Null model | Operator |
|----------|-----------|----------|
| Java | Everything nullable, no compiler help | `Optional<T>` (not universal) |
| Swift | `Optional<T>` / `T?` | `?.`, `??`, `!` |
| Go | Pointers can be nil, no optional type | Manual nil checks |
| TypeScript | `T \| null`, strict null checks optional | `?.`, `??` |

Kotlin and Swift have the closest models. The key difference: Kotlin's `let`/`run`/`also`/`apply` are generic scope functions, not null-specific — but they compose naturally with `?.` for null-safe transformations.

## The task

Implement the following top-level functions in `stub.kt`:

- `firstNonNull(vararg values: String?): String?` — returns the first non-null, non-blank string in the list, or `null` if none exists.
- `safeDivide(a: Int, b: Int): Double?` — returns `a.toDouble() / b` or `null` if `b` is zero.
- `parsePositiveInt(s: String?): Int?` — parses `s` as an integer and returns it only if it is positive (> 0). Returns `null` for null input, non-numeric strings, or non-positive values.
- `coalesce(primary: String?, secondary: String?, fallback: String): String` — returns the first non-null, non-blank value among `primary`, `secondary`, and `fallback`. `fallback` is guaranteed non-null.
