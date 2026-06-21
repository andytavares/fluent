# Classes & Data Classes

## What you'll learn

Kotlin's `class` syntax is dramatically more concise than Java's. `data class` auto-generates `equals`, `hashCode`, `toString`, and `copy`. `object` creates singletons. `companion object` gives you Java-style static members.

## Key concepts

**Regular classes**

The primary constructor is declared inline with the class header. `val`/`var` in the constructor declares and initializes a property in one shot:

```kotlin
class Circle(val radius: Double) {
    fun area() = Math.PI * radius * radius
    fun perimeter() = 2 * Math.PI * radius
}

val c = Circle(5.0)
println(c.radius)   // 5.0
println(c.area())   // 78.53...
```

No `new` keyword. No `this.radius = radius` boilerplate.

**Secondary constructors and `init` blocks**

```kotlin
class Rectangle(val width: Double, val height: Double) {
    init {
        require(width > 0 && height > 0) { "Dimensions must be positive" }
    }
}
```

**`data class`**

Add `data` to get `equals`, `hashCode`, `toString`, and `copy` for free — based on all properties declared in the primary constructor:

```kotlin
data class Point(val x: Int, val y: Int)

val p1 = Point(1, 2)
val p2 = Point(1, 2)
println(p1 == p2)          // true (structural equality)
println(p1)                // Point(x=1, y=2)
val p3 = p1.copy(y = 10)   // Point(x=1, y=10)
```

**Destructuring declarations**

`data class` components map to positional destructuring:

```kotlin
val (x, y) = Point(3, 4)
println("$x, $y")   // 3, 4
```

**`object` — singletons**

```kotlin
object Config {
    val maxRetries = 3
    fun isDebug() = false
}

Config.maxRetries   // accessed directly, no instantiation
```

**`companion object` — static-like members**

```kotlin
class User(val name: String) {
    companion object {
        fun fromJson(json: String): User = User("parsed")   // factory method
        const val MAX_NAME_LENGTH = 50
    }
}

User.fromJson("{}")
User.MAX_NAME_LENGTH
```

## vs other languages

| Concept | Java | Swift | Kotlin |
|---------|------|-------|--------|
| Boilerplate for a value type | `equals`, `hashCode`, `toString`, getters, builder | `struct` (auto) | `data class` (auto) |
| Singleton | `static` instance + private constructor | `static let shared` | `object` |
| Static members | `static` methods/fields | `static` on struct/class | `companion object` |
| Constructor | Separate block, `this.x = x` | `init(x:)` | Primary constructor in header |
| Structural equality | `.equals()` | `==` with `Equatable` | `==` on data class |

The biggest shift from Java: Kotlin's `==` calls `equals`. Reference equality is `===`.

## The task

Implement the following in `stub.kt`:

- `data class Money(val amount: Double, val currency: String)` — a data class representing a monetary value.
- `fun Money.add(other: Money): Money` — extension function that adds two `Money` values. Throw `IllegalArgumentException` if currencies differ.
- `fun Money.format(): String` — returns a string like `"USD 42.50"` (currency, space, amount formatted to 2 decimal places).
- `object ExchangeRates` — singleton with `fun usdToEur(amount: Double): Double` that multiplies by `0.92`, and `fun eurToUsd(amount: Double): Double` that multiplies by `1.0 / 0.92`.
