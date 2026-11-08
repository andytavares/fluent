## What you build

You model an arithmetic expression tree with a sealed class, then evaluate it and print it with `when`. A sealed class and `when` with smart casts are Kotlin's main pattern-matching tool. This lesson builds on **Collections**.

## Key concepts

### A sealed class has a closed set of subclasses

The compiler knows every direct subclass at compile time. Direct subclasses must be in the same package and module as the sealed class. They can be top-level or nested, and each one is a `class`, `data class` or `object`.

```kotlin
sealed class Shape {
    data class Circle(
        val radius: Double,
    ) : Shape()
    data class Rect(
        val width: Double,
        val height: Double,
    ) : Shape()
    // A singleton variant
    object Triangle : Shape()
}
```

Swift's `enum` with associated values is the closest match. In Kotlin, each variant is a full class with its own methods.

### `when` on a sealed type is exhaustive

As an expression, `when` must cover every subclass, or have an `else`. If you add a variant, every `when` that misses it stops compiling.

```kotlin
val shape: Shape = Shape.Circle(5.0)

val area = when (shape) {
    is Shape.Circle ->
        Math.PI * shape.radius *
            shape.radius
    is Shape.Rect ->
        shape.width * shape.height
    is Shape.Triangle -> 0.0
}
```

### An `is` check is a smart cast

After `is`, the compiler treats the value as that subtype. You write no explicit cast.

```kotlin
if (shape is Shape.Circle) {
    // shape is Shape.Circle here
    println(shape.radius)
}
```

### `when` can also be a statement

Without an assignment, `when` works like a `switch` statement.

```kotlin
when (shape) {
    is Shape.Circle -> println("circle")
    else -> println("other")
}
```

### `when` with no argument replaces an `if` chain

Each branch is a condition. The first true branch runs.

```kotlin
val x = 42
val label = when {
    x < 0   -> "negative"
    x == 0  -> "zero"
    x < 100 -> "small"
    else    -> "large"
}
```

### You can seal an interface too

A class that implements a sealed interface can still extend another class.

```kotlin
sealed interface Result<out T>
data class Success<T>(val value: T) :
    Result<T>
data class Failure(val error: String) :
    Result<Nothing>
```

## Watch out

- A non-exhaustive `when` statement on a sealed, enum or `Boolean` subject is an error since Kotlin 1.7. Before that, it was only a warning.
- A nested subclass needs its qualified name, for example `Expr.Num(3.0)`. Bare `Num(3.0)` fails unless you add `import Expr.*`.
- A sealed class can declare an abstract member that every subclass must implement. Use it with `when` instead of scattered type checks.

## The task

`Expr` is a small arithmetic expression tree. Define it in `stub.kt` and write two functions that walk it.

1. Declare `sealed class Expr`. Nest its four subclasses inside it, so callers write `Expr.Num` and `Expr.Add`.
2. `data class Num(val value: Double) : Expr()` is a literal number.
3. `data class Add(val left: Expr, val right: Expr) : Expr()` is the sum of two sub-expressions.
4. `data class Mul(val left: Expr, val right: Expr) : Expr()` is the product of two sub-expressions.
5. `data class Neg(val expr: Expr) : Expr()` is the negation of a sub-expression.
6. `fun evaluate(expr: Expr): Double` returns the numeric value of the tree.
7. `fun describe(expr: Expr): String` returns the tree as text, with parentheses around every operation.

`describe` writes a number with `Double.toString()`, so `3.0` gives `"3.0"`. Both functions handle any depth of nesting.

```kotlin
evaluate(Expr.Num(42.0))  // 42.0
evaluate(Expr.Neg(Expr.Neg(
    Expr.Num(5.0))))      // 5.0
describe(Expr.Num(42.0))  // "42.0"
describe(Expr.Add(Expr.Num(1.0),
    Expr.Num(2.0)))   // "(1.0 + 2.0)"
describe(Expr.Mul(Expr.Num(2.0),
    Expr.Num(3.0)))   // "(2.0 * 3.0)"
describe(Expr.Neg(Expr.Num(4.0)))
// "(-4.0)"

val e = Expr.Add(
    Expr.Num(1.0),
    Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)),
)
evaluate(e)  // 7.0
describe(e)  // "(1.0 + (2.0 * 3.0))"
```
