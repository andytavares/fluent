# Functions

## What you'll learn

Kotlin functions are first-class citizens. This concept covers the full function feature set: named/default parameters, single-expression syntax, extension functions, infix functions, and `vararg`.

## Key concepts

**Basic function syntax**

```kotlin
fun add(a: Int, b: Int): Int {
    return a + b
}
```

**Single-expression functions**

When the body is a single expression, drop the braces and return type (the compiler infers it):

```kotlin
fun add(a: Int, b: Int) = a + b
fun square(x: Double) = x * x
```

**Default and named arguments**

Parameters can have default values. Callers can name arguments to skip earlier ones or improve readability:

```kotlin
fun greet(name: String, greeting: String = "Hello") = "$greeting, $name!"

greet("Ada")                        // "Hello, Ada!"
greet("Ada", "Hi")                  // "Hi, Ada!"
greet(name = "Ada", greeting = "Yo") // named — order doesn't matter
greet(greeting = "Hey", name = "Ada")
```

This eliminates most overload chains you'd write in Java.

**Extension functions**

Add methods to existing classes without subclassing or wrappers:

```kotlin
fun String.isPalindrome(): Boolean = this == this.reversed()

"racecar".isPalindrome()  // true
"hello".isPalindrome()    // false
```

Extensions are resolved statically — they're syntactic sugar for a top-level function. They cannot access private members.

**Infix functions**

A function with exactly one parameter can be called with infix notation when marked `infix`:

```kotlin
infix fun Int.times(str: String) = str.repeat(this)

3 times "ha"   // "hahaha"
```

The standard library uses this for `to` in map literals: `"key" to "value"`.

**`vararg`**

Accept a variable number of arguments with `vararg`. Inside the function, `vararg` is treated as an `Array<T>`. Use the spread operator `*` to pass an existing array:

```kotlin
fun sum(vararg numbers: Int): Int = numbers.sum()

sum(1, 2, 3)         // 6
val arr = intArrayOf(1, 2, 3)
sum(*arr)            // spread
```

## vs other languages

| Feature | Java | Swift | Go | Kotlin |
|---------|------|-------|----|--------|
| Default params | No (use overloads) | Yes | No | Yes |
| Named args | No | Yes (labels) | No | Yes |
| Extension functions | No | Yes | No (use methods) | Yes |
| Variadic | `T...` | `T...` | `...T` | `vararg` |
| Single-expr function | No | No | No | Yes (`=`) |

The extension function design means you can add methods to `String`, `List`, or any third-party class without inheritance. This is heavily used in the Kotlin stdlib itself.

## The task

Implement the following in `stub.kt`:

- `repeat(str: String, times: Int = 2): String` — returns `str` repeated `times` times. Default is 2 repetitions.
- `String.wordCount(): Int` — extension function on `String` that returns the number of words (split on whitespace, ignoring empty tokens).
- `joinWith(vararg parts: String, separator: String = ", "): String` — joins the variadic `parts` with `separator`.
- `infix fun Int.pow(exp: Int): Int` — integer exponentiation: `2 pow 10` returns `1024`. Assume `exp >= 0`.
