# Optional

## What you'll learn

`Optional<T>` is Java's way of making "possibly absent" values explicit in the type system. Instead of returning `null` and hoping the caller checks, you return `Optional<T>` — the caller is forced to handle the absent case.

## Key concepts

**Creating an Optional:**
```java
Optional<String> present = Optional.of("hello");       // must not be null
Optional<String> maybe   = Optional.ofNullable(null);  // null → empty
Optional<String> empty   = Optional.empty();
```

**Checking and extracting:**
```java
present.isPresent();    // true
present.isEmpty();      // false (Java 11+)
present.get();          // "hello" — throws if empty, prefer orElse

present.orElse("default");     // value if present, else "default"
present.orElseGet(() -> compute()); // lazy default via supplier
present.orElseThrow();              // get() or throw NoSuchElementException
```

**Transforming with map / flatMap:**
```java
Optional<String> upper = present.map(String::toUpperCase);  // Optional<"HELLO">

// flatMap avoids Optional<Optional<T>>:
Optional<String> nested = Optional.of("  hello  ");
Optional<String> trimmed = nested.flatMap(s -> {
    String t = s.trim();
    return t.isEmpty() ? Optional.empty() : Optional.of(t);
});
```

**filter:**
```java
Optional<Integer> big = Optional.of(42).filter(n -> n > 10);  // Optional.of(42)
Optional<Integer> small = Optional.of(5).filter(n -> n > 10); // Optional.empty()
```

**vs other languages:** Kotlin uses nullable types (`String?`) at the language level — more ergonomic. Scala has `Option[T]`. Go returns `(T, error)` or `(T, bool)` tuples instead. Java's `Optional` is a library solution, not a language primitive — which is why it's verbose but still widely used.

## The task

Implement three static methods in `Solution.java`:

- `static Optional<Integer> parseIntSafe(String s)` — parse `s` as an integer, returning `Optional.of(n)` on success or `Optional.empty()` if it cannot be parsed
- `static Optional<String> firstLongWord(List<String> words, int minLen)` — return the first word in `words` with length ≥ `minLen`, or empty if none
- `static int sumOptionals(List<Optional<Integer>> opts)` — return the sum of all present values (absent values contribute 0)
