# Exception Handling

## What you'll learn

Building on inheritance (concept 6) — custom exceptions are just classes that extend `Exception` or `RuntimeException`: Java divides exceptions into two camps: **checked** exceptions (subclasses of `Exception` but not `RuntimeException`) that the compiler forces you to handle or declare, and **unchecked** exceptions (`RuntimeException` and its subclasses) that you can ignore. Modern Java code trends toward unchecked exceptions — checked exceptions often end up swallowed or wrapped, which is worse than not catching them.

## Key concepts

**try/catch/finally:**
```java
try {
    int result = Integer.parseInt(s);
} catch (NumberFormatException e) {
    // unchecked — compiler doesn't require you to catch this
    System.err.println("bad input: " + e.getMessage());
} finally {
    // always runs — even if an exception was thrown or caught
}
```

**Multi-catch (Java 7+):**
```java
try {
    // ...
} catch (IllegalArgumentException | IllegalStateException e) {
    // handles either
}
```

**Custom exceptions:**
```java
public class ValidationException extends RuntimeException {
    private final String field;

    public ValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() { return field; }
}
```
Extend `RuntimeException` for exceptions callers usually cannot recover from. Extend `Exception` (checked) only when callers genuinely need to handle the error — e.g., `IOException`.

**try-with-resources (Java 7+):**
```java
try (var reader = new BufferedReader(new FileReader(path))) {
    return reader.readLine();
}  // reader.close() called automatically — even on exception
```

**vs other languages:** C++ exceptions are unchecked — no compiler enforcement. Go returns errors as values — no try/catch at all. Python exceptions are unchecked. TypeScript/JavaScript: same as Python. Java's checked exceptions are unique and divisive — many engineers consider them a design mistake for most use cases.

## Watch out

- **A custom `RuntimeException` still needs to call `super(message)`** if you want `getMessage()` to work — forgetting it silently leaves the message `null`.
- **Catching `Exception` (or worse, `Throwable`)** swallows exceptions you didn't anticipate, including bugs like `NullPointerException`. Catch the most specific type your code can actually recover from.
- **Re-throwing inside a loop:** when one item in a batch fails, decide deliberately whether to stop immediately (propagate the first failure, as this task does) or collect all failures and report them together — the two behave very differently for callers.

## The task

You're building a small validation layer with a custom exception type that carries an HTTP-style status code. Implement the following in `Solution.java`:

**`class AppException extends RuntimeException`** — constructor `AppException(String message, int code)` that forwards `message` to `RuntimeException`'s constructor and stores `code`; getter `int getCode()`.

**`static int parsePositiveInt(String s)`** — parses `s` as an integer and returns it if it's `> 0`. Throws `new AppException("not a number", 400)` if `s` isn't a valid integer. Throws `new AppException("must be positive", 422)` if the parsed value is `<= 0`.

**`static String safeRead(String input)`** — validates and trims `input`. Throws `new AppException("null input", 400)` if `input` is `null`. Throws `new AppException("blank input", 400)` if `input.trim()` is empty. Otherwise returns `input.trim()`.

**`static int sumInts(List<String> strs)`** — calls `parsePositiveInt` on each string and sums the results; if any string fails to parse, that `AppException` propagates immediately (the sum is abandoned, not partially computed).

```java
parsePositiveInt("42");   // 42
parsePositiveInt("1");    // 1
parsePositiveInt("abc");  // throws AppException("not a number", 400)
parsePositiveInt("0");    // throws AppException("must be positive", 422)
parsePositiveInt("-5");   // throws AppException("must be positive", 422)

safeRead("  hello  ");    // "hello"
safeRead("ok");           // "ok"
safeRead(null);           // throws AppException("null input", 400)
safeRead("   ");          // throws AppException("blank input", 400)
safeRead("");             // throws AppException("blank input", 400)

sumInts(List.of("1", "2", "3"));       // 6
sumInts(List.of("10"));                // 10
sumInts(List.of("1", "bad", "3"));     // throws AppException("not a number", 400)
```
