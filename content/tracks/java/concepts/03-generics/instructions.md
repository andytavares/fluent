# Generics

## What you'll learn

Java generics let you write classes and methods that work with any type while preserving compile-time type safety. Instead of using `Object` (and casting everywhere), you parameterize over a type variable `T`.

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

max(3, 5);         // 5 (Integer)
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

**vs other languages:** Java generics use *type erasure* — the type parameter `T` is removed at compile time and replaced with `Object` (or the bound). At runtime there is no `T`. This means you cannot do `new T()`, `T.class`, or `instanceof T` in a generic context.

## The task

Implement the generic class `Pair<A, B>` and two utility methods inside `Solution.java`:

- `Pair(A first, B second)` — constructor
- `A getFirst()` / `B getSecond()` — accessors
- `Pair<B, A> swap()` — return a new Pair with the elements swapped
- `static <T extends Comparable<T>> T min(T a, T b)` — return the smaller value
- `static <T> java.util.List<T> repeat(T value, int times)` — return a List containing `value` repeated `times` times
