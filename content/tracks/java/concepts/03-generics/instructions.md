## What you build

You write a generic `Pair<A, B>` class and two generic methods, `min` and `repeat`. Generics let one class or method work with any type and keep the compile-time type checks. This lesson builds on **Interfaces**.

## Key concepts

### A type parameter replaces `Object`

Without generics, you store `Object` and cast at each use. With a type parameter `T`, the compiler checks that each use is consistent.

```java
public class Box<T> {
    private final T value;

    public Box(T value) {
        this.value = value;
    }

    public T get() { return value; }

    public <U> Box<U> map(
            Function<T, U> fn) {
        return new Box<>(fn.apply(value));
    }
}

Box<Integer> b = new Box<>(42);
Box<String> s = b.map(Object::toString);
```

### A generic method declares its own type

Put the type parameter before the return type. The compiler infers `T` from the arguments.

```java
static <T extends Comparable<T>>
        T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

max(3, 5);               // 5
max("apple", "banana");  // "banana"
```

### A bound limits the type

`T extends Comparable<T>` accepts only types that implement `Comparable`. Without the bound, you cannot call `compareTo` on a `T`, because the compiler does not know the method exists.

```java
// Compile error without the bound
static <T> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
```

### The wildcard `?` reads any subtype

`List<? extends Number>` accepts a list of `Integer`, `Double` or any other subtype of `Number`.

```java
static double sum(
        List<? extends Number> list) {
    return list.stream()
        .mapToDouble(Number::doubleValue)
        .sum();
}
```

### Type erasure removes `T` at runtime

The compiler replaces `T` with `Object`, or with its bound. At runtime there is no `T`, so `new T()`, `T.class` and `instanceof T` do not compile. C++ templates and C# generics keep the type at runtime instead.

```java
// None of these compile:
// new T()
// new T[10]
// x instanceof T
```

## Watch out

- `new T[10]` and `x instanceof T` fail, because the JVM does not know `T` at runtime.
- When you need the type at runtime, pass a `Class<T>` token or a `Supplier<T>` factory.
- Primitives such as `int` and `double` cannot be type arguments. Java boxes them: `min(3, 7)` uses `Integer`.
- A raw type such as `Pair` compiles with an "unchecked" warning. It brings back the `ClassCastException` risk.
- Always give the type arguments, or use the `<>` diamond to infer them.

## The task

Build a generic `Pair` type and two type-safe methods inside the class `Solution`.

1. `Pair<A, B>` is an immutable container for two values of different types.
2. Its constructor is `Pair(A first, B second)`.
3. `A getFirst()` and `B getSecond()` return the two values.
4. `Pair<B, A> swap()` returns a new `Pair` with the values exchanged.
5. `swap()` does not change the original pair.
6. `static <T extends Comparable<T>> T min(T a, T b)` returns the smaller value by `compareTo`.
7. `static <T> List<T> repeat(T value, int times)` returns `value` repeated `times` times.

When `min` gets equal values, it can return either one. When `times` is 0, `repeat` returns an empty list.

```java
Pair<String, Integer> p =
    new Pair<>("hello", 42);
p.getFirst();   // "hello"
p.getSecond();  // 42

Pair<Integer, String> s = p.swap();
s.getFirst();   // 42
s.getSecond();  // "hello"

min(3, 7);               // 3
min(5, 5);               // 5
min("apple", "banana");  // "apple"
min(1.5, 2.5);           // 1.5

repeat("x", 3);  // ["x", "x", "x"]
repeat(99, 1);   // [99]
repeat("z", 0);  // []
```
