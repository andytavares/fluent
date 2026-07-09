# Coroutines

## What you'll learn

"Coroutines" in Kotlin usually means the `kotlinx.coroutines` library (`suspend`, `launch`, `async`) — but that machinery is built on a simpler, language-level feature: **suspendable functions that yield values one at a time**, available in the standard library with no external dependency. This lesson teaches that foundation — coroutine fundamentals via the `sequence { }` builder — which is what `kotlinx.coroutines` itself compiles down to. Understanding it tells you what "suspend" actually means before you add a library on top.

## Key concepts

**A `sequence { }` builder pauses and resumes a block of code**

`sequence { ... }` returns a `Sequence<T>` whose body runs lazily, one step at a time, driven by whoever consumes it:

```kotlin
val naturals = sequence {
    var n = 1
    while (true) {
        yield(n)   // suspends here — hands control back to the consumer
        n++        // resumes here on the next request
    }
}

naturals.take(5).toList()   // [1, 2, 3, 4, 5]
```

`yield` is doing the same conceptual job `suspend`/`await` does in `kotlinx.coroutines`: it pauses execution at that exact point and returns control to the caller, resuming from the same spot (with the same local variables) the next time a value is requested. This is why the block above can hold an infinite loop — nothing runs until you ask for a value, and only as many steps run as you actually consume.

**`yield` vs `yieldAll`**

```kotlin
val letters = sequence {
    yield("a")
    yieldAll(listOf("b", "c"))   // yields each element in turn
    yield("d")
}

letters.toList()   // [a, b, c, d]
```

**Laziness is the whole point**

Each element is computed only when requested. Side effects (like a `println`) prove the order of execution:

```kotlin
val traced = sequence {
    println("computing 1")
    yield(1)
    println("computing 2")
    yield(2)
}

val iter = traced.iterator()
iter.next()   // prints "computing 1", returns 1
iter.next()   // prints "computing 2", returns 2
```

Nothing prints until `next()` is called — contrast with `listOf(...)` or `map`/`filter` on a `List`, which compute everything eagerly up front.

**Building pipelines lazily**

`map`, `filter`, and `take` on a `Sequence` are themselves lazy — chaining them builds a pipeline that only pulls as many source elements as needed:

```kotlin
val result = sequence {
    var n = 1
    while (true) { yield(n); n++ }
}
    .filter { it % 3 == 0 }
    .map { it * it }
    .take(3)
    .toList()

// result = [9, 36, 81] — computed from just enough of the infinite source
```

**Generators that carry state between yields**

Because the block is a normal function body, you can maintain arbitrary local state across suspensions — this is how you write generator-style algorithms (Fibonacci, tree traversal, pagination) without manually threading an index:

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

fibonacci.take(6).toList()   // [0, 1, 1, 2, 3, 5]
```

## Watch out

- `sequence { }` bodies are **restricted suspend functions** — you can only call `yield`/`yieldAll` from directly inside the builder (or a helper explicitly written to accept that scope), not from an arbitrary callback or a different thread. This is a single-threaded, synchronous laziness tool, not a concurrency primitive.
- Forgetting `take`/another terminal limit on an infinite sequence (like `naturals` above) will hang forever if you call `.toList()` on it directly.
- A `Sequence` can only be iterated correctly for something that supports being computed repeatedly from scratch, or once, depending on the builder — recomputing a `sequence { println(...) }` from the start re-runs its side effects. If you need to reuse computed values, convert once with `.toList()` and reuse the list.
- This is deliberately **not** `kotlinx.coroutines`. Real multithreaded suspension (`launch`, `async`, dispatchers) requires that separate library and its own runtime; nothing here starts a background thread.

## The task

Implement the following top-level functions in `stub.kt`, all built on the `sequence { }` / `yield` machinery above — no external libraries.

- `fun fibonacciSequence(): Sequence<Long>` — an infinite lazy sequence of Fibonacci numbers starting `0, 1, 1, 2, 3, 5, ...`.
- `fun <T> pairwise(seq: Sequence<T>): Sequence<Pair<T, T>>` — given a sequence `[a, b, c, d]`, lazily yields consecutive pairs `[(a, b), (b, c), (c, d)]`. An input with fewer than 2 elements yields nothing.
- `fun countdown(from: Int): Sequence<Int>` — lazily yields `from, from - 1, ..., 1, 0` and then stops (finite — must terminate on its own, not rely on `take`).
- `fun <T> interleave(a: Sequence<T>, b: Sequence<T>): Sequence<T>` — lazily yields elements alternating from `a` and `b` (`a[0], b[0], a[1], b[1], ...`). When one sequence runs out, yields the remainder of the other.

```kotlin
fibonacciSequence().take(6).toList()                     // [0, 1, 1, 2, 3, 5]

pairwise(sequenceOf(1, 2, 3, 4)).toList()                // [(1, 2), (2, 3), (3, 4)]
pairwise(sequenceOf(1)).toList()                          // []
pairwise(sequenceOf<Int>()).toList()                      // []

countdown(3).toList()                                     // [3, 2, 1, 0]
countdown(0).toList()                                      // [0]

interleave(sequenceOf(1, 3, 5), sequenceOf(2, 4)).toList() // [1, 2, 3, 4, 5]
interleave(sequenceOf<Int>(), sequenceOf(1, 2)).toList()   // [1, 2]
```
