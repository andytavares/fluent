## What you build

You write three methods that filter, group and average lists with the Streams API. A stream is a lazy pipeline over a collection, so you describe the steps and write no loop. This lesson builds on **Generics**.

## Key concepts

### A stream comes from a source

Java 8 added the Streams API. Call `stream()` on a collection, or use a factory such as `IntStream.rangeClosed`.

```java
import java.util.stream.*;

List<Integer> nums = List.of(1, 2, 3);
Stream<Integer> s = nums.stream();
IntStream r = IntStream.rangeClosed(1, 10);
```

### Intermediate operations are lazy

Each intermediate operation returns a new stream. No work happens until a terminal operation runs. The JVM often does all the steps in one pass.

```java
stream
    // keep evens
    .filter(n -> n % 2 == 0)
    // square each
    .map(n -> n * n)
    .sorted()
    // remove duplicates
    .distinct()
    // take the first 3
    .limit(3);
```

### Terminal operations start the work

A terminal operation runs the pipeline and returns a result.

```java
// List
.collect(Collectors.toList())
// Java 16+, unmodifiable List
.toList()
// long
.count()
// IntStream and DoubleStream only
.sum()
.average()
// Optional<T>
.findFirst()
// boolean
.anyMatch(pred)
// T
.reduce(0, Integer::sum)
```

### `Collectors` build results

`Collectors` gives ready-made ways to join strings, group elements and build maps.

```java
// Concatenate strings
Collectors.joining(", ")
// Map<Integer, List<String>>
Collectors.groupingBy(String::length)
// Map<String, Integer>
Collectors.toMap(
    k -> k, v -> v.length())
```

### Streams are lazy and can run in parallel

Streams do the job of LINQ in .NET and list comprehensions in Python, but nothing runs until the terminal operation. Use `parallelStream()` to run a pipeline in parallel.

```java
long n = words.parallelStream()
    .filter(w -> w.length() > 3)
    .count();
```

## Watch out

- You can use a stream only once. A second terminal operation throws `IllegalStateException`.
- The message is `stream has already been operated upon or closed`. Build a new stream from the source.
- `IntStream.average()` returns `OptionalDouble`, not `double`. An empty stream has no average.
- Handle the empty case with `isPresent()` or `orElse`.
- `Collectors.groupingBy` uses a `HashMap` by default, so the group order is not fixed.
- For a sorted order, pass a map factory: `groupingBy(fn, TreeMap::new, downstream)`.

## The task

Process a list of words with the Streams API. Write three static methods in the class `Solution`.

1. `static List<String> longWords(List<String> words, int minLen)` returns the words with length `>= minLen`.
2. `longWords` sorts the result alphabetically.
3. `static Map<Integer, List<String>> groupByLength(List<String> words)` groups words by length.
4. In `groupByLength`, the key is the length, and the value lists the words in encounter order.
5. `static OptionalDouble averageOfEvens(List<Integer> nums)` returns the average of the even numbers.

When no word matches, `longWords` returns an empty list. When `nums` has no even numbers, or is empty, `averageOfEvens` returns `OptionalDouble.empty()`.

```java
List<String> words = List.of("the",
    "quick", "brown", "fox", "jumps",
    "over");

// ["brown", "jumps", "over", "quick"]
longWords(words, 4);
// []
longWords(words, 10);
// All 6 words, sorted
longWords(words, 1);

// {3: ["the", "fox"], 4: ["over"],
//  5: ["quick", "brown", "jumps"]}
groupByLength(words);

// OptionalDouble[4.0], (2+4+6)/3
averageOfEvens(List.of(1, 2, 3, 4, 5, 6));
// OptionalDouble.empty
averageOfEvens(List.of(1, 3, 5));
// OptionalDouble.empty
averageOfEvens(List.of());
```
