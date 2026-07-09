# Optional

## What you'll learn

Building on streams (concept 4), which already returns `Optional` from operations like `findFirst`: `Optional<T>` is Java's way of making "possibly absent" values explicit in the type system. Instead of returning `null` and hoping the caller checks, you return `Optional<T>` — the caller is forced to handle the absent case, or the compiler nudges them toward it.

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

present.orElse("default");          // value if present, else "default"
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
Optional<Integer> big   = Optional.of(42).filter(n -> n > 10);  // Optional.of(42)
Optional<Integer> small = Optional.of(5).filter(n -> n > 10);   // Optional.empty()
```

**vs other languages:** Kotlin uses nullable types (`String?`) at the language level — more ergonomic, checked everywhere by the compiler. Scala has `Option[T]`. Go returns `(T, error)` or `(T, bool)` tuples instead. Java's `Optional` is a library solution, not a language primitive — which is why it's verbose but still widely used.

## Watch out

- **`Optional.get()` on an empty `Optional` throws `NoSuchElementException`.** Treat `get()` like `.unwrap()` in Rust — only call it after confirming `isPresent()`, or prefer `orElse`/`orElseThrow` with a meaningful message.
- **`Optional.of(null)` throws `NullPointerException` immediately** — use `Optional.ofNullable` whenever the value might genuinely be null.
- **Don't use `Optional` for fields or method parameters** — it's designed as a return type. Using it for fields adds serialization overhead and confusion; a plain nullable field with a null-check is idiomatic there.

## The task

You're writing small utilities that use `Optional` to make "might not exist" explicit instead of returning `null` or a sentinel value. Implement three static methods in `Solution.java`:

**`static Optional<Integer> parseIntSafe(String s)`** — parses `s` as an integer, returning `Optional.of(n)` on success or `Optional.empty()` if `s` cannot be parsed as an integer (including non-integer numeric strings like `"3.14"`).

**`static Optional<String> firstLongWord(List<String> words, int minLen)`** — returns the first word in `words` (in list order) with length `>= minLen`, or `Optional.empty()` if none qualify.

**`static int sumOptionals(List<Optional<Integer>> opts)`** — returns the sum of all present values in `opts`; absent (`empty`) entries contribute `0`.

```java
parseIntSafe("42");    // Optional[42]
parseIntSafe("-7");    // Optional[-7]
parseIntSafe("abc");   // Optional.empty
parseIntSafe("3.14");  // Optional.empty — not a valid integer

List<String> words = List.of("a", "hi", "hello", "world", "greetings");
firstLongWord(words, 5);   // Optional[hello]
firstLongWord(words, 2);   // Optional[hi]     — "hi" has length exactly 2
firstLongWord(words, 20);  // Optional.empty   — nothing that long
firstLongWord(List.of(), 1); // Optional.empty — empty input

sumOptionals(List.of(Optional.of(1), Optional.empty(), Optional.of(3), Optional.of(5))); // 9
sumOptionals(List.of(Optional.empty()));  // 0
sumOptionals(List.of());                  // 0
```
