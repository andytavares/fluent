## What you build

You write a custom exception that carries an HTTP-style status code, and three validation methods that throw it. A custom exception is a class that extends `Exception` or `RuntimeException`. This lesson builds on **Inheritance & Polymorphism**.

## Key concepts

### Checked and unchecked exceptions

A checked exception extends `Exception` but not `RuntimeException`, and the compiler makes you catch it or declare it. An unchecked exception extends `RuntimeException`, and the compiler does not check it.

```java
// Checked: must catch or declare
void read() throws IOException { }
// Unchecked: no declaration needed
void parse() { Integer.parseInt("x"); }
```

### Modern Java prefers unchecked exceptions

Code often swallows or wraps checked exceptions, which is worse than not catching them. C++, Python and JavaScript have only unchecked exceptions, and Go returns errors as values.

```java
// Swallowed: the error disappears
try { read(); }
catch (IOException e) { }
```

### `try`, `catch` and `finally`

The `catch` block handles a matching exception. The `finally` block always runs, also when the code throws or catches an exception.

```java
try {
    int result = Integer.parseInt(s);
} catch (NumberFormatException e) {
    // Unchecked: catching is optional
    System.err.println(
        "bad input: " + e.getMessage());
} finally {
    // Always runs
}
```

### Multi-catch handles several types

Since Java 7, one `catch` block can list several types with `|`.

```java
try {
    // ...
} catch (IllegalArgumentException
         | IllegalStateException e) {
    // Handles either type
}
```

### A custom exception is a class

Pass the message to `super(message)` and store any extra data in fields. Extend `RuntimeException` when callers usually cannot recover. Extend `Exception` only when callers must handle the error, as with `IOException`.

```java
public class ValidationException
        extends RuntimeException {
    private final String field;

    public ValidationException(
            String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
```

### `try`-with-resources closes for you

Since Java 7, a resource that you open in the `try` header closes at the end of the block, also when the code throws.

```java
try (var reader = new BufferedReader(
        new FileReader(path))) {
    return reader.readLine();
}
// reader.close() runs automatically
```

## Watch out

- A custom exception must call `super(message)`. Without it, `getMessage()` returns `null`.
- Catching `Exception` or `Throwable` also catches bugs such as `NullPointerException`.
- Catch the most specific type that your code can recover from.
- In a batch, choose: stop at the first failure, or collect all failures and report them together.
- The two choices give callers very different results. This task stops at the first failure.

## The task

Build a small validation layer with a custom exception that carries an HTTP-style status code. Write these in the class `Solution`.

1. `class AppException extends RuntimeException` has the constructor `AppException(String message, int code)`.
2. The constructor passes `message` to `RuntimeException` and stores `code`.
3. `int getCode()` returns the stored code.
4. `static int parsePositiveInt(String s)` parses `s` and returns the integer when it is `> 0`.
5. If `s` is not a valid integer, throw `new AppException("not a number", 400)`.
6. If the value is `<= 0`, throw `new AppException("must be positive", 422)`.
7. `static String safeRead(String input)` returns `input.trim()`.
8. If `input` is `null`, throw `new AppException("null input", 400)`.
9. If `input.trim()` is empty, throw `new AppException("blank input", 400)`.
10. `static int sumInts(List<String> strs)` calls `parsePositiveInt` on each string and returns the sum.

If one string fails, `sumInts` lets that `AppException` propagate at once. It returns no partial sum.

```java
parsePositiveInt("42");   // 42
parsePositiveInt("1");    // 1
// AppException("not a number", 400)
parsePositiveInt("abc");
// AppException("must be positive", 422)
parsePositiveInt("0");
parsePositiveInt("-5");

safeRead("  hello  ");  // "hello"
safeRead("ok");         // "ok"
// AppException("null input", 400)
safeRead(null);
// AppException("blank input", 400)
safeRead("   ");
safeRead("");

sumInts(List.of("1", "2", "3"));  // 6
sumInts(List.of("10"));           // 10
// AppException("not a number", 400)
sumInts(List.of("1", "bad", "3"));
```
