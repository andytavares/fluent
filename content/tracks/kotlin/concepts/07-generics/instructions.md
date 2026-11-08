## What you build

You write a generic `clamp`, a generic `Stack` class and a `partition` function that reads its type parameter at runtime. Kotlin writes variance as `out` and `in`, and adds `reified` type parameters. This lesson builds on **Sealed Classes & When**.

## Key concepts

### Functions and classes take type parameters

```kotlin
fun <T> identity(value: T): T = value

class Box<T>(val value: T) {
    fun map(transform: (T) -> T) =
        Box(transform(value))
}

val box = Box(42)
// Box(84)
val doubled = box.map { it * 2 }
```

### A bound limits what `T` can be

Write the bound after `:`. Write more than one bound with `where`. Java writes `<T extends A & B>`; Kotlin writes `where T : A, T : B`.

```kotlin
fun <T : Comparable<T>> max(a: T, b: T) =
    if (a > b) a else b

max(3, 5)              // 5
max("apple", "banana") // "banana"

fun <T> process(item: T)
    where T : Comparable<T>,
          T : Cloneable { }
```

### `out` and `in` declare variance on the type

Kotlin uses declaration-site variance. You mark the type parameter once, on the class, not at every use.

- `out T` (covariant): the class only produces `T`. A `Producer<Cat>` is a `Producer<Animal>`.
- `in T` (contravariant): the class only consumes `T`. A `Consumer<Animal>` is a `Consumer<Cat>`.

```kotlin
interface Producer<out T> {
    fun produce(): T
}

interface Consumer<in T> {
    fun consume(item: T)
}
```

Java writes `? extends T` and `? super T` at each use. Kotlin declares `interface List<out E>` once.

### `reified` keeps the type at runtime

The JVM erases generic types, so a normal generic function cannot check `T`. An `inline` function with a `reified` type parameter can. You then need no `Class<T>` parameter.

```kotlin
inline fun <reified T> filterByType(
    list: List<Any>,
): List<T> = list.filterIsInstance<T>()

val mixed =
    listOf(1, "hello", 2.0, "world")
// ["hello", "world"]
filterByType<String>(mixed)
```

`inline` copies the function body into each call site. The concrete type then exists in that copy.

## Watch out

- `reified` works only on an `inline` function. A function that is not `inline` can never inspect its own `T`.
- With `out T`, `T` can appear only in out positions, such as return types. A parameter of type `T` is a compile error.
- `<T : Comparable<T>>` compares a `T` only with another `T`. Both operands of `<` and `>` must be the same `T`.

## The task

You write three generic building blocks in `stub.kt`.

1. `fun <T : Comparable<T>> clamp(value: T, min: T, max: T): T` returns `min` if `value` is below `min`.
2. `clamp` returns `max` if `value` is above `max`. Otherwise it returns `value`.
3. `class Stack<T>` is a last-in, first-out stack.
4. `fun push(item: T)` adds `item` to the top.
5. `fun pop(): T?` removes and returns the top item. On an empty stack it returns `null`.
6. `fun peek(): T?` returns the top item without removing it. On an empty stack it returns `null`.
7. `val size: Int` is the number of items.
8. `inline fun <reified T> partition(list: List<Any>): Pair<List<T>, List<Any>>` splits `list` in two.
9. The first list has the items that are a `T`. The second list has the other items. Both keep the input order.

```kotlin
clamp(5, 1, 10)       // 5
clamp(-1, 0, 10)      // 0
clamp(15, 0, 10)      // 10
clamp("m", "a", "z")  // "m"
clamp(-0.1, 0.0, 1.0) // 0.0

val s = Stack<Int>()
s.pop()     // null
s.push(1)
s.push(2)
s.peek()    // 2
s.size      // 2
s.pop()     // 2
s.pop()     // 1

partition<String>(
    listOf(1, "hello", 2, "world"))
// ([hello, world], [1, 2])
partition<Int>(listOf("a", "b"))
// ([], [a, b])
```
