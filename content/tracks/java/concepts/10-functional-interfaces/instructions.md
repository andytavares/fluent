# Functional Interfaces

## What you'll learn

Building on streams and concurrency (concepts 4, 9), both of which already use lambdas informally: a functional interface in Java is any interface with exactly one abstract method. Lambda expressions and method references can be used wherever a functional interface is expected. The `java.util.function` package gives names to the common shapes so you rarely need to declare your own. This concept formalizes what you've been using implicitly.

## Key concepts

**The built-in functional interfaces:**
```java
import java.util.function.*;

Function<String, Integer>  parse  = Integer::parseInt;   // T → R
Predicate<String>          blank  = String::isBlank;      // T → boolean
Consumer<String>           print  = System.out::println;  // T → void
Supplier<List<String>>     list   = ArrayList::new;        // () → T
UnaryOperator<Integer>     square = n -> n * n;             // T → T
BiFunction<Integer, Integer, Integer> add = Integer::sum;  // (T, U) → R
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

## Watch out

- **`Function.andThen` vs `Function.compose` run in opposite orders.** `f.andThen(g)` computes `g(f(x))` (f first, then g); `f.compose(g)` computes `f(g(x))` (g first, then f). Mixing these up silently produces the wrong pipeline order.
- **`Comparator.comparingInt`/`comparing` builds a *new* `Comparator` each call** — it doesn't mutate anything. `list.sort(cmp)` mutates `list` in place, but building `cmp` itself is pure.
- **`@FunctionalInterface` is a compile-time check, not a requirement.** Any interface with exactly one abstract method already works as a lambda target; the annotation just makes the compiler reject accidental additions of a second abstract method.

## The task

You're building a small toolkit of composable functions and predicates over `java.util.function` types. Implement the following static methods in `Solution.java`:

**`static List<String> filterAndTransform(List<String> items, Predicate<String> keep, Function<String, String> transform)`** — returns a list containing `transform(item)` for each `item` where `keep.test(item)` is `true`, preserving input order.

**`static <T> List<T> applyToAll(List<T> items, UnaryOperator<T> op)`** — returns a new list with `op` applied to every element of `items`.

**`static Comparator<String> byLengthThenAlpha()`** — returns a `Comparator<String>` that orders strings by length ascending, breaking ties alphabetically.

**`static Predicate<String> longerThan(int n)`** — returns a `Predicate<String>` that is `true` exactly when the string's length is strictly greater than `n`.

**`static Function<String, String> pipeline(List<Function<String, String>> fns)`** — composes all functions in `fns` left-to-right into a single `Function`, so `pipeline(List.of(f, g, h)).apply(x)` equals `h(g(f(x)))`. An empty list returns the identity function.

```java
List<String> words = List.of("apple", "hi", "banana", "ok", "cherry");
filterAndTransform(words, longerThan(3), String::toUpperCase);
// ["APPLE", "BANANA", "CHERRY"] — "hi" and "ok" filtered out (length <= 3)

applyToAll(List.of(1, 2, 3, 4), n -> n * 2);  // [2, 4, 6, 8]

Comparator<String> cmp = byLengthThenAlpha();
List<String> sorted = new ArrayList<>(List.of("banana", "apple", "hi", "ok", "cherry"));
sorted.sort(cmp);
// ["hi", "ok", "apple", "banana", "cherry"]
//   length 2,2      5       6        6     — "banana" < "cherry" alphabetically

Predicate<String> gt3 = longerThan(3);
gt3.test("apple");  // true  — length 5 > 3
gt3.test("abc");    // false — length 3 is not > 3

Function<String, String> pipe = pipeline(List.of(String::trim, String::toUpperCase, s -> s + "!"));
pipe.apply("  hello  ");  // "HELLO!"
pipeline(List.of()).apply("x");  // "x" — empty list = identity
```
