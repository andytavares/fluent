## What you build

You write three methods that return or consume `Optional` values in place of `null`. Streams already return `Optional` from operations such as `findFirst`. This lesson builds on **Streams API**.

## Key concepts

### `Optional<T>` puts absence in the type

A method that returns `null` relies on the caller to check. A method that returns `Optional<T>` shows in its type that the value can be absent, so the caller must handle that case.

```java
Optional<User> findUser(String id)
```

### Three ways to create one

`Optional.of` needs a value that is not null. `Optional.ofNullable` turns `null` into an empty `Optional`.

```java
// Value must not be null
Optional<String> present =
    Optional.of("hello");
// null gives an empty Optional
Optional<String> maybe =
    Optional.ofNullable(null);
Optional<String> empty =
    Optional.empty();
```

### Check and extract the value

Prefer `orElse` and `orElseThrow` to `get()`, which throws when the `Optional` is empty.

```java
present.isPresent();  // true
// Java 11+
present.isEmpty();    // false
// "hello"; throws if empty
present.get();

// The value, or "default"
present.orElse("default");
// Lazy default from a supplier
present.orElseGet(() -> compute());
// The value, or NoSuchElementException
present.orElseThrow();
```

### `map` and `flatMap` transform the value

`map` applies a function to a present value. `flatMap` takes a function that returns an `Optional`, so you do not get `Optional<Optional<T>>`.

```java
// Optional[HELLO]
Optional<String> upper =
    present.map(String::toUpperCase);

Optional<String> nested =
    Optional.of("  hello  ");
Optional<String> trimmed =
    nested.flatMap(s -> {
        String t = s.trim();
        return t.isEmpty()
            ? Optional.empty()
            : Optional.of(t);
    });
```

### `filter` keeps a value that matches

When the predicate is false, `filter` returns an empty `Optional`.

```java
// Optional[42]
Optional.of(42).filter(n -> n > 10);
// Optional.empty
Optional.of(5).filter(n -> n > 10);
```

### `Optional` is a library class

Kotlin puts nullable types (`String?`) in the language, Scala has `Option[T]` and Go returns `(T, error)` or `(T, bool)`. Java's `Optional` is a class, not a language feature, so it is more verbose.

```java
// Kotlin: val name: String? = null
Optional<String> name =
    Optional.empty();
```

## Watch out

- `get()` on an empty `Optional` throws `NoSuchElementException`.
- Treat `get()` like `unwrap()` in Rust. Call it only after `isPresent()`, or use `orElseThrow` with a clear message.
- `Optional.of(null)` throws `NullPointerException` at once. Use `Optional.ofNullable` when the value can be null.
- Do not use `Optional` for fields or method parameters. It is a return type.
- An `Optional` field adds serialization cost and confusion. Use a plain field and a null check there.

## The task

Write three methods that use `Optional` in place of `null` or a sentinel value. Put them as static methods in the class `Solution`.

1. `static Optional<Integer> parseIntSafe(String s)` parses `s` as an integer.
2. `parseIntSafe` returns `Optional.of(n)` on success and `Optional.empty()` on failure.
3. `static Optional<String> firstLongWord(List<String> words, int minLen)` returns a word, in list order.
4. `firstLongWord` returns the first word with length `>= minLen`, or `Optional.empty()`.
5. `static int sumOptionals(List<Optional<Integer>> opts)` returns the sum of the present values.

A decimal string such as `"3.14"` is not an integer. An empty list gives `Optional.empty()` from `firstLongWord` and `0` from `sumOptionals`. Empty entries add `0`.

```java
parseIntSafe("42");    // Optional[42]
parseIntSafe("-7");    // Optional[-7]
parseIntSafe("abc");   // Optional.empty
parseIntSafe("3.14");  // Optional.empty

List<String> words = List.of("a", "hi",
    "hello", "world", "greetings");
// Optional[hello]
firstLongWord(words, 5);
// Optional[hi]: length exactly 2
firstLongWord(words, 2);
// Optional.empty
firstLongWord(words, 20);
// Optional.empty
firstLongWord(List.of(), 1);

// 9
sumOptionals(List.of(Optional.of(1),
    Optional.empty(), Optional.of(3),
    Optional.of(5)));
// 0
sumOptionals(List.of(Optional.empty()));
// 0
sumOptionals(List.of());
```
