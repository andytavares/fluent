# Streams API

## What you'll learn

Building on generics (concept 3): Java 8 introduced the Streams API — a functional pipeline for processing collections. A stream is a lazy sequence of elements; you describe the transformations and the JVM executes them efficiently, often in one pass, without you writing an explicit loop.

## Key concepts

**Creating a stream:**
```java
import java.util.stream.*;

List<Integer> nums = List.of(1, 2, 3, 4, 5);
Stream<Integer> s = nums.stream();
IntStream range = IntStream.rangeClosed(1, 10);
```

**Intermediate operations** (lazy — no work happens until a terminal):
```java
stream
  .filter(n -> n % 2 == 0)     // keep evens
  .map(n -> n * n)              // square each
  .sorted()                     // sort ascending
  .distinct()                   // remove duplicates
  .limit(3);                    // take first 3
```

**Terminal operations** (trigger execution):
```java
.collect(Collectors.toList())   // → List
.toList()                       // Java 16+, unmodifiable
.count()                        // → long
.sum()  / .average()            // IntStream, DoubleStream
.findFirst()                    // → Optional<T>
.anyMatch(pred)                 // → boolean
.reduce(0, Integer::sum)        // → T
```

**`Collectors` helpers:**
```java
Collectors.joining(", ")                       // concat strings
Collectors.groupingBy(String::length)          // Map<Integer, List<String>>
Collectors.toMap(k -> k, v -> v.length())      // Map<String, Integer>
```

**vs other languages:** Streams are Java's answer to LINQ (.NET), Python list comprehensions, and Go's range loops with closures. The key difference: streams are lazy — nothing runs until a terminal operation is called — and can be parallel with `.parallelStream()`.

## Watch out

- **A stream can only be consumed once.** Calling a second terminal operation on an already-consumed stream throws `IllegalStateException: stream has already been operated upon or closed`. Rebuild the pipeline from the source collection if you need to traverse it again.
- **`IntStream.average()` returns `OptionalDouble`, not `double`** — an empty stream has no average, so you must handle the empty case (`isPresent()` / `orElse`) rather than assuming a value.
- **`Collectors.groupingBy` uses a `HashMap` by default** — iteration order over the groups is not guaranteed. If you need insertion or sorted order, pass an explicit map factory (`Collectors.groupingBy(fn, TreeMap::new, downstream)`).

## The task

You're processing a list of words with the Streams API. Implement three static methods in `Solution.java`:

**`static List<String> longWords(List<String> words, int minLen)`** — returns the words with length `>= minLen`, sorted alphabetically.

**`static Map<Integer, List<String>> groupByLength(List<String> words)`** — groups words by their character count; the map key is the length, the value is the list of words with that length (in encounter order).

**`static OptionalDouble averageOfEvens(List<Integer> nums)`** — returns the average of all even numbers in `nums`; `OptionalDouble.empty()` if there are none.

```java
List<String> words = List.of("the", "quick", "brown", "fox", "jumps", "over");

longWords(words, 4);   // ["brown", "jumps", "over", "quick"] — sorted alphabetically
longWords(words, 10);  // []                                  — nothing matches
longWords(words, 1);   // all 6 words, sorted alphabetically

groupByLength(words);
// { 3: ["the", "fox"], 4: ["over"], 5: ["quick", "brown", "jumps"] }

averageOfEvens(List.of(1, 2, 3, 4, 5, 6));  // OptionalDouble[4.0]  — (2+4+6)/3
averageOfEvens(List.of(1, 3, 5));           // OptionalDouble.empty — no evens
averageOfEvens(List.of());                  // OptionalDouble.empty — empty input
```
