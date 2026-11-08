## What you build

You write `compose`, `memoize`, `pipeline` and `timed`: functions that take or return other functions. The standard library is built on such functions, from `filter` to `use` to `buildString`. This lesson builds on **Coroutines**.

## Key concepts

### A function type is `(Params) -> Result`

Store a lambda in a variable, or pass it as an argument.

```kotlin
val double: (Int) -> Int = { x -> x * 2 }
val greet: (String) -> String =
    { name -> "Hello, $name!" }
val always42: () -> Int = { 42 }

fun applyTwice(f: (Int) -> Int, x: Int) =
    f(f(x))

applyTwice({ n -> n + 3 }, 10)   // 16
```

### A trailing lambda goes outside the parentheses

When the last parameter is a function, you can write the lambda after the call. This makes DSL-style calls such as `buildString { append("hello") }` and every coroutine builder possible.

```kotlin
fun withLogging(
    label: String,
    block: () -> Unit,
) {
    println("start: $label")
    block()
    println("end: $label")
}

// The same call, two ways
withLogging("task", { doWork() })
// Preferred: trailing lambda
withLogging("task") { doWork() }
```

### `it` names a single parameter

A lambda with one parameter can skip the name and use `it`.

```kotlin
listOf(1, 2, 3).map { it * 2 }
// [2, 4, 6]
```

### A function can return a function

The returned lambda captures `factor`. It is a closure.

```kotlin
fun multiplier(factor: Int): (Int) -> Int =
    { x -> x * factor }

val triple = multiplier(3)
triple(7)   // 21
```

### `inline` removes the lambda object

`inline` copies the function body and its lambda arguments into each call site. This removes the object that a normal higher-order function allocates for each lambda.

```kotlin
inline fun <T> measure(block: () -> T): T {
    val start = System.currentTimeMillis()
    val result = block()
    val ms =
        System.currentTimeMillis() - start
    println("Elapsed: ${ms}ms")
    return result
}
```

### `inline` allows a non-local return

Inside a lambda passed to an `inline` function, `return` returns from the outer function.

```kotlin
inline fun findFirst(
    list: List<Int>,
    predicate: (Int) -> Boolean,
): Int? {
    for (item in list) {
        // Returns from findFirst
        if (predicate(item)) return item
    }
    return null
}
```

### You write function composition yourself

Kotlin has no built-in compose operator. A short generic function does the job.

```kotlin
fun <A, B, C> compose(
    f: (B) -> C,
    g: (A) -> B,
): (A) -> C = { x -> f(g(x)) }

val addOne: (Int) -> Int = { it + 1 }
val double: (Int) -> Int = { it * 2 }
val addOneThenDouble =
    compose(double, addOne)
addOneThenDouble(3)   // 8
```

## Watch out

- A non-`inline` higher-order function allocates an object for each lambda. In a hot loop, mark the function `inline` if you own it.
- A bare `return` in a lambda works only if the receiving function is `inline`. Otherwise it is a compile error.
- `it` exists only for a lambda with exactly one unnamed parameter. With two parameters, you must name both.

## The task

You write four tools that combine or wrap functions. Write these top-level functions in `stub.kt`:

1. `fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C` returns a function that applies `g`, then `f`.
2. `fun <T> memoize(fn: (T) -> T): (T) -> T` returns a function that caches the result of `fn` for each input.
3. The memoized function calls `fn` at most once per distinct input. `T` works as a `Map` key.
4. `fun pipeline(vararg fns: (Int) -> Int): (Int) -> Int` returns a function that applies `fns` from left to right.
5. A pipeline with no functions returns its input unchanged.
6. `inline fun <T> timed(label: String, block: () -> T): T` runs `block` and returns its result.
7. `timed` also prints `"<label>: <ms>ms"` to standard output, where `<ms>` is the run time in milliseconds.

```kotlin
compose<Int, Int, Int>(
    { it * 2 }, { it + 1 })(3)  // 8
compose<Int, String, Int>(
    { it.length }, { it.toString() })(100)
// 3

var calls = 0
val sq = memoize<Int> { n ->
    calls++; n * 2 }
sq(3); sq(3); sq(3)
calls       // 1

pipeline({ it + 1 }, { it * 2 },
    { it - 3 })(5)  // 9
pipeline()(7)       // 7

// Prints "mytask: 0ms", returns 42
timed("mytask") { 42 }
```
