# Functional Interfaces

## What you'll learn

A functional interface in Java is any interface with exactly one abstract method. Lambda expressions and method references can be used wherever a functional interface is expected. The `java.util.function` package provides a standard set of them. Combined with streams (concept 04), they are the backbone of modern Java code.

## Key concepts

**The built-in functional interfaces:**
```java
import java.util.function.*;

Function<String, Integer>  parse  = Integer::parseInt;   // T → R
Predicate<String>          blank  = String::isBlank;     // T → boolean
Consumer<String>           print  = System.out::println; // T → void
Supplier<List<String>>     list   = ArrayList::new;      // () → T
UnaryOperator<Integer>     square = n -> n * n;           // T → T
BiFunction<Integer, Integer, Integer> add = Integer::sum; // (T, U) → R
```

**Composing functions:**
```java
Function<String, String> trim       = String::trim;
Function<String, String> upperCase  = String::toUpperCase;
Function<String, String> trimThenUp = trim.andThen(upperCase);

Predicate<String> notBlank  = Predicate.not(String::isBlank);
Predicate<String> shortWord = s -> s.length() < 5;
Predicate<String> both      = notBlank.and(shortWord);
```

**`Comparator.comparing`:**
```java
List<String> words = List.of("banana", "apple", "cherry");
words.stream()
     .sorted(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()))
     .toList();
```

**Custom `@FunctionalInterface`:**
```java
@FunctionalInterface
interface Validator<T> {
    boolean validate(T value);
    // can have default/static methods — still functional
}

Validator<String> notEmpty = s -> !s.isEmpty();
```

**vs other languages:** JavaScript functions are first-class by default. Python has `lambda` and `functools`. Go has first-class function values. Java's approach is more verbose — functional interfaces are full types, which means stronger type safety and better tooling integration, but more ceremony. TypeScript function types (`(x: T) => R`) are closer to the JS style.

## The task

Implement the following static methods in `Solution.java` using lambdas, method references, and the `java.util.function` package:

- `List<String> filterAndTransform(List<String> items, Predicate<String> keep, Function<String, String> transform)` — return a list of `transform(item)` for each item where `keep.test(item)` is true
- `<T> List<T> applyToAll(List<T> items, UnaryOperator<T> op)` — return a new list with `op` applied to each element
- `Comparator<String> byLengthThenAlpha()` — return a Comparator that sorts by length ascending, breaking ties alphabetically
- `Predicate<String> longerThan(int n)` — return a Predicate that is true when the string length is > n
- `Function<String, String> pipeline(List<Function<String, String>> fns)` — compose all functions left-to-right into a single Function; an empty list returns the identity function
