# Streams API

## What you'll learn

Java 8 introduced the Streams API — a functional pipeline for processing collections. A stream is a lazy sequence of elements; you describe the transformations and the JVM executes them efficiently, often in one pass.

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

**vs other languages:** Streams are Java's answer to LINQ (.NET), Python list comprehensions, and Go's range loops with closures. The key difference: streams are lazy and can be parallel with `.parallelStream()`.

## The task

Implement three static methods in `Solution.java` using the Streams API:

- `static List<String> longWords(List<String> words, int minLen)` — return words with length ≥ minLen, sorted alphabetically
- `static Map<Integer, List<String>> groupByLength(List<String> words)` — group words by their character count
- `static OptionalDouble averageOfEvens(List<Integer> nums)` — return the average of all even numbers in nums (empty Optional if there are none)
