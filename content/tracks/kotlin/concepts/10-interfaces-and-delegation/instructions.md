## What you build

You write a `Cache` interface, a map-backed cache, a logging wrapper that delegates with `by`, and a lazy property. With `by`, you delegate an interface to another object in one line. This lesson builds on **Higher-Order Functions**.

## Key concepts

### An interface can have default methods

A class that implements the interface inherits the default methods. It overrides only the abstract ones.

```kotlin
interface Logger {
    fun log(message: String)
    fun warn(message: String) =
        log("[WARN] $message")
    fun error(message: String) =
        log("[ERROR] $message")
}

class ConsoleLogger : Logger {
    override fun log(message: String) =
        println(message)
    // warn and error come from Logger
}
```

### An interface can declare abstract properties

Each implementing class must override the property.

```kotlin
interface Named {
    val name: String
}
```

### `by` forwards an interface to a delegate

The compiler generates every interface method as a call to the delegate. Java needs one hand-written forwarding method per interface method. You override only the methods you want to change.

```kotlin
interface Printer {
    fun print(text: String)
}

class RealPrinter : Printer {
    override fun print(text: String) =
        println(text)
}

class LoggingPrinter(
    private val delegate: Printer,
) : Printer by delegate {
    override fun print(text: String) {
        println("[LOG]")
        delegate.print(text)
    }
}
```

### A property can delegate to an object

The delegate object supplies `getValue` and `setValue`. You can write your own delegate with `ReadOnlyProperty` or `ReadWriteProperty`.

```kotlin
class Config {
    // Computed once, on first access
    val timeout by lazy {
        computeExpensiveDefault()
    }

    var retries: Int by
        Delegates.observable(3) {
            _, old, new ->
            println("$old -> $new")
        }
}
```

### `lazy` computes a value once

The block runs on first access, and later reads return the stored result. By default, `lazy` synchronizes the first access: one thread computes the value, and all threads see it. Swift's `lazy var` is the closest match.

```kotlin
val heavyResource by lazy {
    println("initializing...")
    HeavyResource()
}
// Prints "initializing..." on first
// access only
```

### `Delegates.observable` calls back on each write

The callback gets the property, the old value and the new value.

```kotlin
var name: String by
    Delegates.observable("initial") {
        prop, old, new ->
        println("${prop.name}: $new")
    }
```

### A map can hold property values

Each property reads the map entry with its own name. Use it for JSON-like objects or dynamic property bags.

```kotlin
class User(map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

val user = User(
    mapOf("name" to "Ada", "age" to 30))
user.name   // "Ada"
user.age    // 30
```

## Watch out

- `by delegate` forwards every interface method. In a method you override, you must call the delegate yourself.
- `LazyThreadSafetyMode.NONE` skips the synchronization and its overhead. Use it only if one thread creates and reads the property.
- A property delegated `by map` needs a key with its exact name. A missing key throws `NoSuchElementException` at runtime, not at compile time.

## The task

You build a small cache, then add logging to it without changing it. Write these in `stub.kt`:

1. `interface Cache<K, V>` declares `fun get(key: K): V?`, `fun put(key: K, value: V)`, `fun invalidate(key: K)` and `val size: Int`.
2. `class InMemoryCache<K, V> : Cache<K, V>` stores the entries in a `HashMap`.
3. In `InMemoryCache`, `get` returns `null` for a missing key. `put` on an existing key replaces the value.
4. `invalidate` removes the entry. `size` is the number of entries.
5. `class LoggingCache<K, V>(private val delegate: Cache<K, V>) : Cache<K, V> by delegate` wraps any cache.
6. `LoggingCache` prints `"GET <key>"`, `"PUT <key>"` or `"INVALIDATE <key>"` before it forwards that call.
7. Override only `get`, `put` and `invalidate`. `size` delegates through `by` and prints nothing.
8. Declare the top-level property `val appVersion: String by lazy { "1.0.0-${System.currentTimeMillis() / 1000}" }`.

`appVersion` starts with `"1.0.0-"`. Every read returns the same value.

```kotlin
val c = InMemoryCache<String, Int>()
c.put("k", 1)
c.put("k", 2)
c.get("k")        // 2
c.size            // 1
c.invalidate("k")
c.get("k")        // null

val log = LoggingCache(
    InMemoryCache<String, Int>())
log.put("x", 7)   // prints PUT x
log.get("x")      // prints GET x
log.invalidate("x")
// prints INVALIDATE x
log.size          // 0, prints nothing

appVersion        // "1.0.0-<seconds>"
```
