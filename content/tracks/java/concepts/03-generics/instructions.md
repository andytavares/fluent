# Generics

## What you'll learn

Building on classes and interfaces (concepts 1–2): Java generics let you write classes and methods that work with any type while preserving compile-time type safety. Instead of using `Object` (and casting everywhere), you parameterize over a type variable `T`, and the compiler checks that every use is consistent.

## Key concepts

**Generic class:**
```java
public class Box<T> {
    private final T value;

    public Box(T value) { this.value = value; }

    public T get() { return value; }

    public <U> Box<U> map(java.util.function.Function<T, U> fn) {
        return new Box<>(fn.apply(value));
    }
}

Box<Integer> b = new Box<>(42);
Box<String>  s = b.map(Object::toString);  // Box<String>
```

**Generic method:**
```java
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

max(3, 5);               // 5 (Integer)
max("apple", "banana");  // "banana" (String)
```

**Bounded type parameters** (`T extends Comparable<T>`) constrain `T` to types that implement `Comparable`. Without the bound, you can't call `compareTo` on a `T` — the compiler doesn't know it's available.

**Wildcard `?`:**
```java
// reads from a list of any subtype of Number
public static double sum(java.util.List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}
```

**vs other languages:** Java generics use *type erasure* — the type parameter `T` is removed at compile time and replaced with `Object` (or the bound). At runtime there is no `T`. This means you cannot do `new T()`, `T.class`, or `instanceof T` in a generic context. This differs sharply from C++ templates (fully reified, one specialized copy of the code per type) and from C# generics (also reified via CLR support).

## Watch out

- **Type erasure bites at runtime.** You can't write `new T[10]` or `if (x instanceof T)` — the JVM has already forgotten what `T` was by the time your method runs. Work around it by passing a `Class<T>` token or a factory `Supplier<T>` when you truly need runtime type info.
- **Autoboxing in bounded generics:** `T extends Comparable<T>` works with `Integer`, `Double`, `String`, etc., but primitives (`int`, `double`) can't be type arguments directly — they're boxed automatically (`min(3, 7)` boxes to `Integer`).
- **Raw types compile but lose safety.** Using `Pair` instead of `Pair<A, B>` compiles with an "unchecked" warning and silently reintroduces the `ClassCastException` risk generics exist to prevent. Always specify the type arguments (or use `<>` diamond inference).

## The task

You're building a generic `Pair` type and two type-safe utility methods, all inside `Solution.java`.

**`Pair<A, B>`** — an immutable container for two values of possibly different types.
- Constructor `Pair(A first, B second)`.
- `A getFirst()` / `B getSecond()` — accessors.
- `Pair<B, A> swap()` — returns a **new** `Pair` with the elements swapped (does not mutate the original).

**`static <T extends Comparable<T>> T min(T a, T b)`** — returns whichever of `a` or `b` is smaller according to `compareTo`; if equal, either may be returned.

**`static <T> java.util.List<T> repeat(T value, int times)`** — returns a `List<T>` containing `value` repeated `times` times; `times == 0` returns an empty list.

```java
Pair<String, Integer> p = new Pair<>("hello", 42);
p.getFirst();          // "hello"
p.getSecond();          // 42

Pair<Integer, String> swapped = p.swap();
swapped.getFirst();     // 42
swapped.getSecond();    // "hello"

min(3, 7);              // 3
min(5, 5);              // 5   — equal inputs, either is acceptable
min("apple", "banana"); // "apple"
min(1.5, 2.5);          // 1.5

repeat("x", 3);         // ["x", "x", "x"]
repeat(99, 1);          // [99]
repeat("z", 0);         // []  — zero repeats is an empty list, not an error
```
