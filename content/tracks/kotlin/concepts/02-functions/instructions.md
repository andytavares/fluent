## What you build

You write four functions, each with a different Kotlin function feature: default arguments, an extension, `vararg` and `infix`. This lesson builds on **Variables & Types**.

## Key concepts

### A single-expression function drops the braces

When the body is one expression, write `=` and the expression. The compiler infers the return type.

```kotlin
fun add(a: Int, b: Int): Int {
    return a + b
}

fun add2(a: Int, b: Int) = a + b
fun square(x: Double) = x * x
```

### Parameters can have defaults and names

A parameter can have a default value. A caller can name arguments to skip a default or to make the call clear. This removes most of the overload chains you write in Java.

```kotlin
fun greet(
    name: String,
    greeting: String = "Hello",
) = "$greeting, $name!"

greet("Ada")         // "Hello, Ada!"
greet("Ada", "Hi")   // "Hi, Ada!"
// Named: the order does not matter
greet(greeting = "Hey", name = "Ada")
```

### An extension function adds a method to a class

You add a function to an existing class without a subclass or a wrapper. The Kotlin standard library uses extensions on `String`, `List` and other types. An extension is a top-level function in disguise, so it cannot read private members.

```kotlin
fun String.isPalindrome() =
    this == this.reversed()

"racecar".isPalindrome()  // true
"hello".isPalindrome()    // false
```

### An `infix` function reads like an operator

Mark a member or extension function with one parameter as `infix`. You then call it without the dot and the parentheses. The map syntax `"key" to "value"` uses the `infix` function `to`.

```kotlin
infix fun Int.times(str: String) =
    str.repeat(this)

3 times "ha"   // "hahaha"
```

### `vararg` takes any number of arguments

Inside the function, a `vararg` parameter is an array. Use the spread operator `*` to pass an existing array.

```kotlin
fun sum(vararg numbers: Int) =
    numbers.sum()

sum(1, 2, 3)   // 6
val arr = intArrayOf(1, 2, 3)
sum(*arr)      // 6
```

## Watch out

- Kotlin picks an extension from the declared type at the call site. It does not dispatch on the runtime type.
- A function has at most one `vararg` parameter. Callers must name every parameter after it.
- Since Kotlin 1.4, you can put a positional argument after a named one only if it is in its own position.

## The task

Write four functions in `stub.kt`. Each one uses a different Kotlin function feature.

1. `repeat(str: String, times: Int = 2): String` returns `str` repeated `times` times. `times` is 2 when the caller leaves it out. `times = 0` returns `""`.
2. `String.wordCount(): Int` is an extension function. It returns the number of words. Words are separated by one or more whitespace characters. Leading and trailing whitespace does not count. An empty string has 0 words.
3. `joinWith(vararg parts: String, separator: String = ", "): String` joins `parts` with `separator`. Empty parts stay in the result.
4. `infix fun Int.pow(exp: Int): Int` raises the number to the power `exp`. `exp` is 0 or more. Any number to the power 0 is 1.

```kotlin
repeat("ha")              // "haha"
repeat("ab", 3)           // "ababab"
repeat("x", 0)            // ""
"  foo bar  ".wordCount() // 2
"a  b   c".wordCount()    // 3
"".wordCount()            // 0
joinWith("a", "b", "c")   // "a, b, c"
joinWith("", "")          // ", "
2 pow 10                  // 1024
5 pow 0                   // 1

// Returns "a|b|c":
joinWith("a", "b", "c", separator = "|")
```
