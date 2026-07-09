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

## Watch out

- `when` is only exhaustiveness-checked (no `else` required) when it's used as an **expression** (its result is assigned or returned) against a sealed type. As a bare statement, the compiler won't complain about a missing branch.
- Nesting the subclasses inside the sealed class (as in the task below) means every reference to a variant is qualified, e.g. `Expr.Num(3.0)`, not bare `Num(3.0)` — unless you add `import Expr.*`.
- `sealed class` still lets you add an abstract member (property or function) that every subclass must implement — combine this with `when` for exhaustive dispatch instead of instance checks scattered through the codebase.

## The task

Define and implement the following in `stub.kt`. `Expr` is a small arithmetic expression tree.

- `sealed class Expr` with subclasses nested inside it (so they're referenced as `Expr.Num`, `Expr.Add`, etc.):
  - `data class Num(val value: Double) : Expr()` — a literal number.
  - `data class Add(val left: Expr, val right: Expr) : Expr()` — sum of two sub-expressions.
  - `data class Mul(val left: Expr, val right: Expr) : Expr()` — product of two sub-expressions.
  - `data class Neg(val expr: Expr) : Expr()` — negation of a sub-expression.
- `fun evaluate(expr: Expr): Double` — recursively evaluates an `Expr` tree to its numeric value.
- `fun describe(expr: Expr): String` — recursively renders an `Expr` tree as a human-readable string, fully parenthesized:
  - `Expr.Num(3.0)` → `"3.0"`
  - `Expr.Add(Expr.Num(1.0), Expr.Num(2.0))` → `"(1.0 + 2.0)"`
  - `Expr.Mul(Expr.Num(2.0), Expr.Num(3.0))` → `"(2.0 * 3.0)"`
  - `Expr.Neg(Expr.Num(4.0))` → `"(-4.0)"`

```kotlin
val e = Expr.Add(Expr.Num(1.0), Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))
evaluate(e)   // 7.0
describe(e)   // "(1.0 + (2.0 * 3.0))"
```
