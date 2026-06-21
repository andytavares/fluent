# Collections

## What you'll learn

Kotlin's collections come in two flavors — read-only and mutable — and ship with a rich functional API. This concept covers `List`, `Map`, `Set`, the transformation functions, and sequences for lazy evaluation.

## Key concepts

**Read-only vs mutable**

`listOf`, `mapOf`, `setOf` return read-only views. `mutableListOf`, `mutableMapOf`, `mutableSetOf` return mutable collections. "Read-only" doesn't mean immutable — it means the reference you hold doesn't expose mutation methods.

```kotlin
val numbers = listOf(1, 2, 3, 4, 5)   // List<Int>, no add/remove
val words = mutableListOf("a", "b")    // MutableList<Int>
words.add("c")

val scores = mapOf("Alice" to 95, "Bob" to 87)
val registry = mutableMapOf<String, Int>()
registry["Carol"] = 91
```

**Transformations**

```kotlin
val nums = listOf(1, 2, 3, 4, 5)

nums.filter { it % 2 == 0 }            // [2, 4]
nums.map { it * it }                   // [1, 4, 9, 16, 25]
nums.reduce { acc, n -> acc + n }      // 15
nums.fold(10) { acc, n -> acc + n }    // 25 (with initial value)
nums.groupBy { if (it % 2 == 0) "even" else "odd" }
    // {odd=[1,3,5], even=[2,4]}

listOf(listOf(1, 2), listOf(3, 4)).flatMap { it }  // [1, 2, 3, 4]

nums.any { it > 4 }     // true
nums.all { it > 0 }     // true
nums.none { it > 10 }   // true
nums.count { it > 2 }   // 3
nums.sumOf { it }        // 15
nums.maxOrNull()         // 5
```

**Destructuring in loops**

```kotlin
for ((key, value) in scores) {
    println("$key scored $value")
}
```

**Sequences — lazy evaluation**

For large collections, `asSequence()` defers computation until a terminal operation. This avoids creating intermediate lists for each step:

```kotlin
// Without sequence: creates 3 intermediate lists
(1..1_000_000).filter { it % 2 == 0 }.map { it * 2 }.take(5)

// With sequence: processes elements one at a time, stops after 5
(1..1_000_000).asSequence().filter { it % 2 == 0 }.map { it * 2 }.take(5).toList()
```

Use sequences when chaining multiple operations on large collections. For small collections, direct list operations are fine and often faster due to lower overhead.

## vs other languages

| Language | Immutable collection | Lazy eval | Stream API |
|----------|---------------------|-----------|-----------|
| Java | `List.of(...)` (unmodifiable) | `Stream<T>` | `java.util.stream` |
| Go | No first-class collection types | No | No |
| Swift | `let arr = [...]` (value type, copied) | `lazy` property | No |
| TypeScript | `readonly T[]` | Generator functions | No |

Java's `Stream` is closest to Kotlin's `Sequence`, but you must explicitly call `.stream()` and terminal operations are more verbose. Kotlin's collection functions work directly on `List` and return `List`, making them easier to compose.

## The task

Implement the following top-level functions in `stub.kt`:

- `topN(scores: Map<String, Int>, n: Int): List<String>` — returns the names of the top `n` scorers, sorted descending by score. If `n` > size of map, return all names.
- `wordFrequency(words: List<String>): Map<String, Int>` — counts occurrences of each word (case-sensitive).
- `flatten(nested: List<List<Int>>): List<Int>` — flattens one level of nesting.
- `runningTotal(numbers: List<Int>): List<Int>` — returns a list where each element is the cumulative sum up to that index. `[1, 2, 3]` → `[1, 3, 6]`.
