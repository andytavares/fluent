## What you build

You write a `Money` data class, two extension functions on it and an `ExchangeRates` singleton. This lesson builds on **Functions**.

## Key concepts

### The primary constructor is in the class header

`val` or `var` in the header declares a property and sets it in one step. Kotlin has no `new` keyword and no `this.radius = radius` lines.

```kotlin
class Circle(val radius: Double) {
    fun area() = Math.PI * radius * radius
}

val c = Circle(5.0)
println(c.radius)   // 5.0
println(c.area())   // 78.53...
```

### An `init` block runs at construction

Put checks on the constructor values in an `init` block.

```kotlin
class Rectangle(
    val width: Double,
    val height: Double,
) {
    init {
        require(width > 0 && height > 0) {
            "Dimensions must be positive"
        }
    }
}
```

### `data class` generates `equals`, `hashCode`, `toString` and `copy`

The compiler builds these four functions from the properties in the primary constructor. In Kotlin, `==` calls `equals`, and `===` checks reference equality.

```kotlin
data class Point(val x: Int, val y: Int)

val p1 = Point(1, 2)
val p2 = Point(1, 2)
println(p1 == p2)  // true
println(p1)        // Point(x=1, y=2)
val p3 = p1.copy(y = 10)
// p3 is Point(x=1, y=10)
```

### A data class supports destructuring

Each constructor property maps to a position.

```kotlin
val (x, y) = Point(3, 4)
println("$x, $y")   // 3, 4
```

### `object` declares a singleton

You use the object by its name. You never create an instance.

```kotlin
object Config {
    val maxRetries = 3
    fun isDebug() = false
}

Config.maxRetries   // 3
```

### `companion object` holds static-like members

Members of the companion object belong to the class, not to an instance. Use it for factory functions and constants.

```kotlin
class User(val name: String) {
    companion object {
        const val MAX_NAME_LENGTH = 50
        fun fromJson(json: String) =
            User("parsed")
    }
}

User.fromJson("{}")
User.MAX_NAME_LENGTH
```

## Watch out

- `1.0 / 0.92` is not an exact decimal. It is `108.695652...`.
- Compare `Double` results with a tolerance, not with `==`. Use `kotlin.math.abs(expected - actual) < epsilon`.
- Do not round a stored `Double` to make a test pass. Round only for display, for example in `format()`.
- A data class ignores properties declared in the class body. `equals`, `hashCode`, `toString` and `copy` do not see them.
- Kotlin creates an `object` once, on first access. Do not keep per-request mutable state in one. Use a regular class.

## The task

You model an amount of money in one currency, and convert between US dollars and euros. Write these in `stub.kt`:

1. `data class Money(val amount: Double, val currency: String)`.
2. `fun Money.add(other: Money): Money` returns a new `Money` with the sum of both amounts.
3. If the two currencies differ, `add` throws `IllegalArgumentException`.
4. `fun Money.format(): String` returns the currency, one space, and the amount with exactly 2 decimal places.
5. `object ExchangeRates` has `fun usdToEur(amount: Double): Double`. It multiplies `amount` by `0.92`.
6. `ExchangeRates` also has `fun eurToUsd(amount: Double): Double`. It multiplies `amount` by `1.0 / 0.92`.

`format()` rounds to 2 decimal places. The two conversions return the raw `Double` and do not round. `eurToUsd(100.0)` is about `108.6957`, not `108.70`.

```kotlin
val m1 = Money(10.0, "USD")
val m2 = Money(5.50, "USD")
m1.format()          // "USD 10.00"
m1.add(m2).format()  // "USD 15.50"
Money(42.5, "EUR").format()
// "EUR 42.50"
m1.add(Money(1.0, "EUR"))
// throws IllegalArgumentException
m1.copy(amount = 20.0)
// Money(amount=20.0, currency=USD)

ExchangeRates.usdToEur(100.0)  // 92.0
ExchangeRates.eurToUsd(100.0)
// about 108.6957
```
