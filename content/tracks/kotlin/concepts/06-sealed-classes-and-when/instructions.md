# Sealed Classes & When

## What you'll learn

`sealed class` defines a closed type hierarchy — the compiler knows every possible subtype, enabling exhaustive `when` expressions. Combined with smart casts, this is Kotlin's primary pattern-matching mechanism.

## Key concepts

**`sealed class`**

A sealed class restricts subclassing to the same compilation unit (same file in Kotlin 1.5+). The compiler knows every subclass at compile time:

```kotlin
sealed class Shape {
    data class Circle(val radius: Double) : Shape()
    data class Rectangle(val width: Double, val height: Double) : Shape()
    object Triangle : Shape()   // singleton variant
}
```

All subclasses must be `class`, `object`, or `data class`. They can be declared inside or adjacent to the sealed class in the same file.

**`when` as an expression**

`when` without an argument is a replacement for if-else chains. With an argument, it matches against values, types, or ranges:

```kotlin
val shape: Shape = Shape.Circle(5.0)

val area = when (shape) {
    is Shape.Circle    -> Math.PI * shape.radius * shape.radius   // smart cast
    is Shape.Rectangle -> shape.width * shape.height              // smart cast
    is Shape.Triangle  -> 0.0
}
```

When `when` is used as an expression against a `sealed class`, the compiler enforces exhaustiveness — you must handle every subtype or add an `else`. This eliminates the bug class where a new variant is added but some match site is forgotten.

**Smart casts**

After an `is` check, the compiler narrows the type automatically — no explicit cast needed:

```kotlin
if (shape is Shape.Circle) {
    println(shape.radius)   // shape is Shape.Circle here
}
```

**`when` as a statement**

Drop the assignment to use `when` as a statement (like a `switch` statement):

```kotlin
when (shape) {
    is Shape.Circle -> println("circle")
    else -> println("other")
}
```

**`when` with no argument**

```kotlin
val x = 42
val label = when {
    x < 0    -> "negative"
    x == 0   -> "zero"
    x < 100  -> "small"
    else     -> "large"
}
```

**Sealed interfaces (Kotlin 1.5+)**

You can also seal an interface, which allows subclasses to extend other classes:

```kotlin
sealed interface Result<out T>
data class Success<T>(val value: T) : Result<T>
data class Failure(val error: String) : Result<Nothing>
```

## vs other languages

| Language | Closed type hierarchy | Pattern matching | Exhaustive check |
|----------|----------------------|------------------|-----------------|
| Java | No sealed types (Java 17+ has `sealed`) | `switch` (limited, improving in Java 21) | No |
| Swift | `enum` with associated values | `switch` with pattern matching | Yes |
| Go | No sum types | Type switches | No |
| TypeScript | Discriminated unions (`type T = A \| B`) | `switch` on discriminant | With `never` trick |

Kotlin's `sealed class` is closest to Swift's enum with associated values. The difference: Kotlin variants are full classes, so each can have its own methods and hierarchy.

## The task

Define and implement the following in `stub.kt`:

- `sealed class Expr` with subclasses:
  - `data class Num(val value: Double)`
  - `data class Add(val left: Expr, val right: Expr)`
  - `data class Mul(val left: Expr, val right: Expr)`
  - `data class Neg(val expr: Expr)`
- `fun evaluate(expr: Expr): Double` — recursively evaluates an `Expr` tree.
- `fun describe(expr: Expr): String` — returns a human-readable string:
  - `Num(3.0)` → `"3.0"`
  - `Add(Num(1.0), Num(2.0))` → `"(1.0 + 2.0)"`
  - `Mul(Num(2.0), Num(3.0))` → `"(2.0 * 3.0)"`
  - `Neg(Num(4.0))` → `"(-4.0)"`
