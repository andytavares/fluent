# Generics

## What you'll learn

Kotlin generics cover the same territory as Java generics but with cleaner syntax for variance (`out`/`in` instead of `? extends`/`? super`) and a unique feature — `reified` type parameters — that solves one of Java's biggest generic limitations.

## Key concepts

**Generic functions and classes**

```kotlin
fun <T> identity(value: T): T = value

class Box<T>(val value: T) {
    fun map(transform: (T) -> T): Box<T> = Box(transform(value))
}

val box = Box(42)
val doubled = box.map { it * 2 }   // Box(84)
```

**Type bounds**

Constrain what `T` can be with `:`:

```kotlin
fun <T : Comparable<T>> max(a: T, b: T): T = if (a > b) a else b

max(3, 5)         // 5
max("apple", "banana")  // "banana"
```

Multiple bounds use `where`:

```kotlin
fun <T> process(item: T) where T : Comparable<T>, T : Cloneable { ... }
```

**Variance: `out` and `in`**

Kotlin uses declaration-site variance — you annotate the type parameter on the class, not at the call site.

- `out T` (covariant) — the class only **produces** `T`. You can assign `Producer<Cat>` to `Producer<Animal>`.
- `in T` (contravariant) — the class only **consumes** `T`. You can assign `Consumer<Animal>` to `Consumer<Cat>`.

```kotlin
interface Producer<out T> {
    fun produce(): T
}

interface Consumer<in T> {
    fun consume(item: T)
}
```

This is equivalent to Java's `? extends T` and `? super T`, but declared on the interface rather than every call site.

**`reified` type parameters**

Java erases generic types at runtime — you can't write `T::class` inside a generic function. Kotlin solves this with `inline` + `reified`:

```kotlin
inline fun <reified T> filterByType(list: List<Any>): List<T> =
    list.filterIsInstance<T>()

val mixed = listOf(1, "hello", 2.0, "world")
filterByType<String>(mixed)   // ["hello", "world"]
```

`inline` copies the function body at each call site. `reified` makes the actual type available at runtime, eliminating the need for `Class<T>` parameters.

## vs other languages

| Feature | Java | TypeScript | Kotlin |
|---------|------|------------|--------|
| Variance | Use-site (`? extends`, `? super`) | `extends` on call site | Declaration-site (`out`/`in`) |
| Runtime type info | Erased, use `Class<T>` param | Erased | `reified` with `inline` |
| Type bounds | `<T extends Foo>` | `<T extends Foo>` | `<T : Foo>` |
| Multiple bounds | `<T extends A & B>` | `<T extends A & B>` | `where T : A, T : B` |

Declaration-site variance is the bigger mental shift for Java developers. Instead of writing `List<? extends Animal>` everywhere you pass a list, you declare `interface List<out E>` once and it just works.

## The task

Implement the following in `stub.kt`:

- `fun <T : Comparable<T>> clamp(value: T, min: T, max: T): T` — returns `value` clamped to the range `[min, max]`.
- `class Stack<T>` — a generic LIFO stack with:
  - `fun push(item: T)` — adds item to the top
  - `fun pop(): T?` — removes and returns the top item, or `null` if empty
  - `fun peek(): T?` — returns the top item without removing it, or `null` if empty
  - `val size: Int` — number of items
- `inline fun <reified T> partition(list: List<Any>): Pair<List<T>, List<Any>>` — splits `list` into items that are `T` (first) and items that are not `T` (second).
