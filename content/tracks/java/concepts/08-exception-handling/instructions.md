# Exception Handling

## What you'll learn

Java divides exceptions into two camps: **checked** exceptions (subclasses of `Exception` but not `RuntimeException`) that the compiler forces you to handle or declare, and **unchecked** exceptions (`RuntimeException` and its subclasses) that you can ignore. Modern Java code trends toward unchecked exceptions — checked exceptions often end up swallowed or wrapped, which is worse than not catching them.

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

## The task

Implement the following in `Solution.java`:

- `class AppException extends RuntimeException` — constructor takes `String message` and `int code`; getter `int getCode()`
- `int parsePositiveInt(String s)` — throw `AppException("not a number", 400)` if not parseable; throw `AppException("must be positive", 422)` if ≤ 0; otherwise return the int
- `String safeRead(String input)` — if input is null, throw `AppException("null input", 400)`; if blank (trimmed empty), throw `AppException("blank input", 400)`; otherwise return `input.trim()`
- `int sumInts(List<String> strs)` — call `parsePositiveInt` on each string and sum the results; if any string fails, re-throw its `AppException` immediately
