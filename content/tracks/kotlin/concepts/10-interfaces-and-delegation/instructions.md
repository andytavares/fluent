# Interfaces & Delegation

## What you'll learn

Kotlin interfaces can carry default method implementations. The `by` keyword makes composition over inheritance the path of least resistance — delegate an interface to another object in one line. Property delegation (`lazy`, `observable`, `by map`) extends the same idea to properties.

## Key concepts

**Interfaces with default methods**

```kotlin
interface Logger {
    fun log(message: String)
    fun warn(message: String) = log("[WARN] $message")   // default implementation
    fun error(message: String) = log("[ERROR] $message")
}

class ConsoleLogger : Logger {
    override fun log(message: String) = println(message)
    // warn and error inherited for free
}
```

Unlike Java 8+ default methods, Kotlin interface methods can access `this` and are truly polymorphic.

Interfaces can also declare abstract properties:

```kotlin
interface Named {
    val name: String   // must be overridden
}
```

**Interface delegation with `by`**

The `by` keyword auto-generates all interface method implementations that forward to a delegate:

```kotlin
interface Printer {
    fun print(text: String)
}

class RealPrinter : Printer {
    override fun print(text: String) = println(text)
}

class LoggingPrinter(private val delegate: Printer) : Printer by delegate {
    // All Printer methods forwarded to delegate automatically
    // Override only what you want to intercept:
    override fun print(text: String) {
        println("[LOG]")
        delegate.print(text)
    }
}
```

This replaces the verbose delegation boilerplate you'd write in Java — every method explicitly forwarding to the wrapped object.

**Property delegation**

Properties can delegate to objects that implement `getValue`/`setValue`:

```kotlin
class Config {
    val timeout by lazy { computeExpensiveDefault() }   // computed once, on first access

    var retries: Int by Delegates.observable(3) { _, old, new ->
        println("retries changed: $old -> $new")
    }
}
```

**`lazy`**

Thread-safe by default. The lambda runs once and the result is cached:

```kotlin
val heavyResource by lazy {
    println("initializing...")
    HeavyResource()
}
// "initializing..." only prints on first access
```

**`Delegates.observable`**

Calls a callback whenever the property is written:

```kotlin
var name: String by Delegates.observable("initial") { prop, old, new ->
    println("${prop.name} changed from $old to $new")
}
```

**Delegation to a map**

Useful for JSON-like objects or dynamic property bags:

```kotlin
class User(map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

val user = User(mapOf("name" to "Ada", "age" to 30))
user.name   // "Ada"
user.age    // 30
```

## vs other languages

| Concept | Java | Swift | Go | Kotlin |
|---------|------|-------|-----|--------|
| Default interface methods | Java 8+ `default` | Protocol extensions | No | Yes (cleaner) |
| Interface delegation | Manual boilerplate | No | Interface embedding (partial) | `by` keyword |
| Lazy property | Manual double-checked locking or `Lazy<T>` | `lazy var` | `sync.Once` | `by lazy` |
| Property observers | No (use setter) | `willSet`/`didSet` | No | `Delegates.observable` |

Swift's `lazy var` is the closest equivalent to `by lazy`. The key difference: Kotlin's delegation system is extensible — you can write your own delegates by implementing `ReadOnlyProperty` or `ReadWriteProperty`.

## The task

Implement the following in `stub.kt`:

- `interface Cache<K, V>` with:
  - `fun get(key: K): V?`
  - `fun put(key: K, value: V)`
  - `fun invalidate(key: K)`
  - `val size: Int`
- `class InMemoryCache<K, V> : Cache<K, V>` — simple `HashMap`-backed implementation.
- `class LoggingCache<K, V>(private val delegate: Cache<K, V>) : Cache<K, V> by delegate` — wraps any cache and prints `"GET <key>"`, `"PUT <key>"`, or `"INVALIDATE <key>"` to stdout before forwarding each call. Override only the three methods that need logging; `size` can delegate transparently.
- Top-level property `val appVersion: String by lazy { "1.0.0-${System.currentTimeMillis() / 1000}" }` — lazily initialized, computes once.
