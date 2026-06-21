# Variables & Types

## What you'll learn

How Kotlin's type system works: immutable vs mutable bindings, type inference, the primitive-free type hierarchy, nullable types, and string templates.

## Key concepts

**`val` vs `var`**

`val` is a read-only binding (like `final` in Java or `const`/`let` in Swift). `var` is reassignable. Prefer `val` everywhere — the compiler will tell you when you actually need `var`.

```kotlin
val name: String = "Ada"   // explicit type
val age = 30               // inferred as Int
var score = 0
score += 10                // ok — score is var
```

**The type hierarchy**

Kotlin has no primitives at the language level. `Int`, `Double`, `Boolean`, `Char` are all regular classes. The compiler emits JVM primitives under the hood when possible, but you never write `int` vs `Integer`.

| Kotlin | JVM bytecode |
|--------|-------------|
| `Int`  | `int` / `Integer` |
| `Double` | `double` / `Double` |
| `Boolean` | `boolean` / `Boolean` |
| `String` | `String` |
| `Unit` | `void` (but Unit is a real type with one value) |
| `Any` | `Object` |
| `Nothing` | — (uninhabited type; return type of functions that never return) |

**Nullable types**

Every type in Kotlin is non-nullable by default. To allow `null`, append `?`:

```kotlin
val a: String = "hello"
val b: String? = null     // ok
val c: String = null      // compile error
```

Safe operators for working with nullables:

```kotlin
val len: Int? = b?.length          // null if b is null
val len2: Int = b?.length ?: 0     // Elvis: use 0 if null
val len3: Int = b!!.length         // throws NullPointerException if null — avoid in production
```

**String templates**

```kotlin
val city = "Tokyo"
println("Hello from $city!")                    // simple reference
println("Name has ${name.length} characters")   // arbitrary expression in ${}
```

**Type conversions**

Kotlin does not do implicit numeric widening. You must call explicit conversion functions:

```kotlin
val x: Int = 42
val y: Long = x.toLong()   // explicit
val z: Double = x.toDouble()
```

## vs other languages

| Language | Immutable binding | Nullable | Primitives |
|----------|------------------|----------|------------|
| Java | `final` | `@Nullable` (not enforced) | `int`, `double`, etc. |
| Swift | `let` | `Optional<T>` / `T?` | None (same as Kotlin) |
| Go | none (only `const` for literals) | pointers can be nil | `int`, `float64`, etc. |
| TypeScript | `const` | `T \| null` / strict null checks | None |

The key Kotlin distinction: **nullability is part of the type system and checked at compile time**. You cannot pass a `String?` where a `String` is required without handling the null case first.

## The task

Implement the following top-level functions in `stub.kt`:

- `celsiusToFahrenheit(celsius: Double): Double` — converts Celsius to Fahrenheit using the formula `(celsius * 9.0 / 5.0) + 32.0`
- `greet(name: String?): String` — returns `"Hello, <name>!"` if name is non-null and non-blank, otherwise returns `"Hello, stranger!"`
- `describeNumber(n: Int): String` — returns `"positive"`, `"negative"`, or `"zero"` based on the value of `n`
- `initials(fullName: String): String` — given a full name like `"Ada Lovelace"`, returns the initials like `"A.L."`. Assume words are separated by single spaces and the input is non-empty.
