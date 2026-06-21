# Higher-Order Functions

## What you'll learn

Kotlin treats functions as first-class values. Function types, lambdas, closures, and `inline` functions are central to how the stdlib is designed — everything from `filter` to `use` to `buildString` is a higher-order function.

## Key concepts

**Function types**

Function types are written `(ParamTypes) -> ReturnType`:

```kotlin
val double: (Int) -> Int = { x -> x * 2 }
val greet: (String) -> String = { name -> "Hello, $name!" }
val always42: () -> Int = { 42 }
```

Pass them as parameters:

```kotlin
fun applyTwice(f: (Int) -> Int, x: Int): Int = f(f(x))

applyTwice({ n -> n + 3 }, 10)   // 16
```

**Lambda syntax**

When a lambda is the last parameter, it can be placed outside the parentheses (trailing lambda syntax):

```kotlin
fun withLogging(label: String, block: () -> Unit) {
    println("start: $label")
    block()
    println("end: $label")
}

// equivalent calls:
withLogging("task", { doWork() })
withLogging("task") { doWork() }   // trailing lambda — preferred
```

When the lambda has a single parameter, use `it` instead of naming it:

```kotlin
listOf(1, 2, 3).map { it * 2 }   // [2, 4, 6]
```

**Returning functions**

```kotlin
fun multiplier(factor: Int): (Int) -> Int = { x -> x * factor }

val triple = multiplier(3)
triple(7)   // 21
```

**`inline` functions**

`inline` copies the function body and its lambda arguments at the call site, eliminating the object allocation that a normal higher-order function incurs. This matters in performance-sensitive code or when you need `return` from inside a lambda to return from the calling function (non-local return):

```kotlin
inline fun <T> measure(block: () -> T): T {
    val start = System.currentTimeMillis()
    val result = block()
    println("Elapsed: ${System.currentTimeMillis() - start}ms")
    return result
}
```

Non-local return (only possible in `inline` lambdas):

```kotlin
inline fun findFirst(list: List<Int>, predicate: (Int) -> Boolean): Int? {
    for (item in list) {
        if (predicate(item)) return item   // returns from findFirst, not just the lambda
    }
    return null
}
```

**Function composition**

Kotlin doesn't have a built-in compose operator, but it's straightforward to write:

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C = { x -> f(g(x)) }

val addOne: (Int) -> Int = { it + 1 }
val double: (Int) -> Int = { it * 2 }
val addOneThenDouble = compose(double, addOne)
addOneThenDouble(3)   // 8
```

## vs other languages

| Language | Function type syntax | Trailing closure | `inline` |
|----------|---------------------|-----------------|---------|
| Java | `Function<A, B>` | No | No |
| Swift | `(A) -> B` | Yes (trailing closure) | No |
| Go | `func(A) B` | No | No |
| TypeScript | `(a: A) => B` | No | No |

The trailing lambda convention is Kotlin's way of making DSL-style APIs ergonomic. You see it in `buildString { append("hello") }`, `transaction { save(entity) }`, and every coroutine builder.

## The task

Implement the following top-level functions in `stub.kt`:

- `fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C` — returns a function that applies `g` then `f`.
- `fun <T> memoize(fn: (T) -> T): (T) -> T` — returns a memoized version of `fn` that caches results by input. Assume `T` is usable as a `Map` key.
- `fun pipeline(vararg fns: (Int) -> Int): (Int) -> Int` — returns a function that applies each function in `fns` left-to-right to an `Int`. An empty pipeline returns the identity function.
- `inline fun <T> timed(label: String, block: () -> T): T` — runs `block`, prints `"<label>: <ms>ms"` to stdout, and returns the result.
