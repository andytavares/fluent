## What you build

You write four lazy sequence generators with the `sequence { }` builder and `yield`. They teach what "suspend" means before you add the `kotlinx.coroutines` library. This lesson builds on **Generics**.

## Key concepts

### Coroutines start with suspending functions

In Kotlin, "coroutines" often means the `kotlinx.coroutines` library, with `launch` and `async`. That library builds on a language feature: suspending functions. The standard library's `sequence { }` builder uses the same feature and needs no dependency.

### `yield` pauses the block

`sequence { }` returns a `Sequence<T>`. Its body runs one step at a time, when the consumer asks for the next value.

```kotlin
val naturals = sequence {
    var n = 1
    while (true) {
        // Pauses here, gives n to the
        // consumer
        yield(n)
        // Resumes here on the next request
        n++
    }
}

naturals.take(5).toList()
// [1, 2, 3, 4, 5]
```

`yield` does the conceptual job of a suspension point. It stops at that exact line and returns control to the caller. The next request resumes at the same line, with the same local variables. That is why the infinite loop is safe: only as many steps run as you consume.

### `yieldAll` yields each element of a collection

```kotlin
val letters = sequence {
    yield("a")
    yieldAll(listOf("b", "c"))
    yield("d")
}

letters.toList()   // [a, b, c, d]
```

### Nothing runs until you ask for a value

Side effects show the order of execution. A `List`, and `map` or `filter` on a `List`, compute every element at once.

```kotlin
val traced = sequence {
    println("computing 1")
    yield(1)
    println("computing 2")
    yield(2)
}

val iter = traced.iterator()
// Prints "computing 1", returns 1
iter.next()
// Prints "computing 2", returns 2
iter.next()
```

### Sequence operations build a lazy pipeline

`filter`, `map` and `take` on a `Sequence` are lazy too. The pipeline pulls only as many source elements as it needs.

```kotlin
val result = sequence {
    var n = 1
    while (true) { yield(n); n++ }
}
    .filter { it % 3 == 0 }
    .map { it * it }
    .take(3)
    .toList()
// [9, 36, 81]
```

### Local state survives between yields

The block is a normal function body, so local variables keep their values across each pause. You write generators, such as Fibonacci, tree walks or pagination, without a manual index.

```kotlin
val fibonacci = sequence {
    var a = 0
    var b = 1
    while (true) {
        yield(a)
        val next = a + b
        a = b
        b = next
    }
}

fibonacci.take(6).toList()
// [0, 1, 1, 2, 3, 5]
```

## Watch out

- You can call `yield` and `yieldAll` only inside the builder, or in a helper that takes its scope. Callbacks and other threads cannot call them.
- `sequence { }` is single-threaded, synchronous laziness. It is not a concurrency tool.
- `.toList()` on an infinite sequence never returns. Limit it first, for example with `take`.
- Each new iteration of a `sequence { }` runs the block again from the start, with its side effects. To reuse values, call `.toList()` once and keep the list.
- This is not `kotlinx.coroutines`. `launch`, `async` and dispatchers need that library. Nothing here starts a background thread.

## The task

Write four top-level functions in `stub.kt`. Build each one with `sequence { }` and `yield`. Use no external library.

1. `fun fibonacciSequence(): Sequence<Long>` yields the Fibonacci numbers `0, 1, 1, 2, 3, 5, ...` without end.
2. `fun <T> pairwise(seq: Sequence<T>): Sequence<Pair<T, T>>` yields each pair of neighbouring elements.
3. For input `[a, b, c, d]`, `pairwise` yields `(a, b)`, `(b, c)`, `(c, d)`. Fewer than 2 elements yield nothing.
4. `fun countdown(from: Int): Sequence<Int>` yields `from`, `from - 1`, down to `0`, then stops.
5. `countdown` must end on its own. A caller can call `toList()` on it with no `take`.
6. `fun <T> interleave(a: Sequence<T>, b: Sequence<T>): Sequence<T>` yields `a[0]`, `b[0]`, `a[1]`, `b[1]`, and so on.
7. When one input runs out, `interleave` yields the rest of the other.

All four must be lazy. A filter on the infinite Fibonacci sequence, followed by `take`, must finish.

```kotlin
fibonacciSequence().take(6).toList()
// [0, 1, 1, 2, 3, 5]
fibonacciSequence()
    .filter { it % 2 == 0L }
    .take(3).toList()
// [0, 2, 8]

pairwise(sequenceOf(1, 2, 3, 4))
    .toList()
// [(1, 2), (2, 3), (3, 4)]
pairwise(sequenceOf(1)).toList()  // []

countdown(3).toList()  // [3, 2, 1, 0]
countdown(0).toList()  // [0]

interleave(sequenceOf(1, 3, 5),
    sequenceOf(2, 4)).toList()
// [1, 2, 3, 4, 5]
interleave(sequenceOf<Int>(),
    sequenceOf(1, 2)).toList()
// [1, 2]
```
