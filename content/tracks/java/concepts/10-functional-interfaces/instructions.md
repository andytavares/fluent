## What you build

You write five small methods that filter, transform, sort and compose with `java.util.function` types. Streams and thread pools already take lambdas, and this lesson names the types behind them. This lesson builds on **Concurrency**.

## Key concepts

### One abstract method makes a functional interface

A functional interface has exactly one abstract method. You can pass a lambda or a method reference wherever Java expects a functional interface.

```java
Runnable task =
    () -> System.out.println("run");
```

### `java.util.function` names the common shapes

The package covers the common function shapes, so you rarely declare your own interface.

```java
import java.util.function.*;

// T → R
Function<String, Integer> parse =
    Integer::parseInt;
// T → boolean
Predicate<String> blank =
    String::isBlank;
// T → void
Consumer<String> print =
    System.out::println;
// () → T
Supplier<List<String>> list =
    ArrayList::new;
// T → T
UnaryOperator<Integer> square =
    n -> n * n;
// (T, U) → R
BiFunction<Integer, Integer, Integer>
    add = Integer::sum;
```

### Functions and predicates compose

`andThen` chains two functions. `and`, `or` and `Predicate.not` combine predicates.

```java
Function<String, String> trim =
    String::trim;
Function<String, String> up =
    String::toUpperCase;
Function<String, String> trimThenUp =
    trim.andThen(up);

Predicate<String> notBlank =
    Predicate.not(String::isBlank);
Predicate<String> shortWord =
    s -> s.length() < 5;
Predicate<String> both =
    notBlank.and(shortWord);
```

### `Comparator.comparing` builds a comparator

`Comparator.comparing` takes a key function. `thenComparing` adds a tie-breaker.

```java
List<String> words = List.of(
    "banana", "apple", "cherry");
words.stream()
    .sorted(Comparator
        .comparing(String::length)
        .thenComparing(
            Comparator.naturalOrder()))
    .toList();
```

### You can declare your own

`@FunctionalInterface` marks an interface as a lambda target. Default and static methods do not count as abstract methods.

```java
@FunctionalInterface
interface Validator<T> {
    boolean validate(T value);
    // Default and static methods are OK
}

Validator<String> notEmpty =
    s -> !s.isEmpty();
```

### Function types are full interfaces

JavaScript, Python, Go and TypeScript use plain function values, but a Java functional interface is a full type with more ceremony and stronger checks.

```java
// TypeScript: (x: string) => number
Function<String, Integer> len =
    String::length;
```

## Watch out

- `andThen` and `compose` run in opposite orders. A mix-up gives the wrong pipeline order.
- `f.andThen(g)` computes `g(f(x))`: `f` first. `f.compose(g)` computes `f(g(x))`: `g` first.
- `Comparator.comparing` and `comparingInt` build a new `Comparator` on each call. They change nothing.
- `list.sort(cmp)` changes `list` in place. Building `cmp` has no side effects.
- `@FunctionalInterface` is a compile-time check, not a requirement.
- Any interface with one abstract method is a lambda target. The annotation rejects a second abstract method.

## The task

Build a small toolkit of composable functions and predicates. Write these static methods in the class `Solution`.

1. `static List<String> filterAndTransform(List<String> items, Predicate<String> keep, Function<String, String> transform)` filters and maps.
2. It returns `transform(item)` for each `item` where `keep.test(item)` is `true`, in input order.
3. `static <T> List<T> applyToAll(List<T> items, UnaryOperator<T> op)` returns a new list with `op` applied to each element.
4. `static Comparator<String> byLengthThenAlpha()` orders strings by length, shortest first.
5. `byLengthThenAlpha` orders strings of equal length alphabetically.
6. `static Predicate<String> longerThan(int n)` is `true` only when the length is strictly greater than `n`.
7. `static Function<String, String> pipeline(List<Function<String, String>> fns)` composes `fns` left to right.
8. `pipeline(List.of(f, g, h)).apply(x)` equals `h(g(f(x)))`.

An empty list gives an empty result from `filterAndTransform` and `applyToAll`. An empty list gives the identity function from `pipeline`.

```java
List<String> words = List.of("apple",
    "hi", "banana", "ok", "cherry");
// ["APPLE", "BANANA", "CHERRY"]
filterAndTransform(words,
    longerThan(3), String::toUpperCase);

// [2, 4, 6, 8]
applyToAll(List.of(1, 2, 3, 4),
    n -> n * 2);
// []
applyToAll(List.of(), n -> n);

Comparator<String> cmp =
    byLengthThenAlpha();
cmp.compare("hi", "apple");     // < 0
cmp.compare("apple", "mango");  // < 0
List<String> sorted = new ArrayList<>(
    List.of("banana", "apple", "hi",
        "ok", "cherry"));
sorted.sort(cmp);
// ["hi", "ok", "apple", "banana",
//  "cherry"]

Predicate<String> gt3 = longerThan(3);
gt3.test("apple");  // true
gt3.test("hi");     // false
gt3.test("abc");    // false

Function<String, String> pipe =
    pipeline(List.of(String::trim,
        String::toUpperCase,
        s -> s + "!"));
pipe.apply("  hello  ");  // "HELLO!"
// "x": identity
pipeline(List.of()).apply("x");
// "WORLD"
pipeline(List.of(String::toUpperCase))
    .apply("world");
```
