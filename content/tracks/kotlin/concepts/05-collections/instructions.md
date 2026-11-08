## What you build

You write four functions that rank, count, flatten and sum collections. Kotlin collections come as read-only or mutable, with a large functional API. This lesson builds on **Null Safety**.

## Key concepts

### Read-only is not the same as immutable

`listOf`, `mapOf` and `setOf` return read-only collections. `mutableListOf`, `mutableMapOf` and `mutableSetOf` return mutable ones. A read-only reference has no methods that change the collection.

```kotlin
// List<Int>: no add or remove
val numbers = listOf(1, 2, 3, 4, 5)
// MutableList<String>
val words = mutableListOf("a", "b")
words.add("c")

val scores =
    mapOf("Alice" to 95, "Bob" to 87)
val registry =
    mutableMapOf<String, Int>()
registry["Carol"] = 91
```

### Transformations return new collections

Each function works directly on a `List` and returns a new `List` or a value. Java needs `.stream()` first.

```kotlin
val nums = listOf(1, 2, 3, 4, 5)

nums.filter { it % 2 == 0 }  // [2, 4]
nums.map { it * it }
// [1, 4, 9, 16, 25]
nums.reduce { acc, n -> acc + n }  // 15
// fold starts from an initial value
nums.fold(10) { acc, n -> acc + n } // 25
nums.groupBy {
    if (it % 2 == 0) "even" else "odd"
}
// {odd=[1, 3, 5], even=[2, 4]}

listOf(listOf(1, 2), listOf(3, 4))
    .flatMap { it }  // [1, 2, 3, 4]

nums.any { it > 4 }    // true
nums.all { it > 0 }    // true
nums.none { it > 10 }  // true
nums.count { it > 2 }  // 3
nums.sumOf { it }      // 15
nums.maxOrNull()       // 5
```

### A `for` loop can destructure map entries

```kotlin
for ((key, value) in scores) {
    println("$key scored $value")
}
```

### A sequence evaluates lazily

`asSequence()` delays work until a terminal operation, such as `toList()`. It processes one element at a time and creates no intermediate lists. Use a sequence for long chains on large collections. For small collections, list operations are fine and often faster.

```kotlin
// Creates 3 intermediate lists
(1..1_000_000)
    .filter { it % 2 == 0 }
    .map { it * 2 }
    .take(5)

// One element at a time, stops after 5
(1..1_000_000).asSequence()
    .filter { it % 2 == 0 }
    .map { it * 2 }
    .take(5)
    .toList()
```

## Watch out

- `mapOf` and `mutableMapOf` keep insertion order. A `HashMap` does not keep any order.
- `sortedBy` and `sortedByDescending` are stable. Equal elements keep their input order.
- Each `filter` or `map` on a `List` builds a new list. Call `.asSequence()` before a long chain, not after it.

## The task

You write four collection helpers. Write these top-level functions in `stub.kt`:

1. `topN(scores: Map<String, Int>, n: Int): List<String>` returns the names of the `n` highest scores, highest first.
2. If `n` is larger than the map, `topN` returns all names. An empty map gives an empty list.
3. `wordFrequency(words: List<String>): Map<String, Int>` counts how many times each word occurs.
4. `wordFrequency` is case-sensitive: `"A"` and `"a"` are different words.
5. `flatten(nested: List<List<Int>>): List<Int>` removes one level of nesting. Empty inner lists add nothing.
6. `runningTotal(numbers: List<Int>): List<Int>` returns, at each index, the sum of all elements up to that index.

```kotlin
topN(mapOf("Alice" to 90, "Bob" to 95,
    "Carol" to 80), 2)
// [Bob, Alice]
topN(mapOf("A" to 1, "B" to 2), 10)
// [B, A]
wordFrequency(
    listOf("a", "b", "a", "c", "b", "a"))
// {a=3, b=2, c=1}
wordFrequency(listOf("A", "a"))
// {A=1, a=1}
flatten(listOf(listOf(1, 2),
    listOf(3, 4)))
// [1, 2, 3, 4]
runningTotal(listOf(1, 2, 3, 4))
// [1, 3, 6, 10]
runningTotal(listOf(10, -3, 5))
// [10, 7, 12]
runningTotal(emptyList())  // []
```
