// TODO: define interface Cache<K, V> with get, put, invalidate, size

// TODO: class InMemoryCache<K, V> : Cache<K, V> — HashMap-backed

// TODO: class LoggingCache<K, V>(private val delegate: Cache<K, V>) : Cache<K, V> by delegate
// Prints "GET <key>", "PUT <key>", or "INVALIDATE <key>" before forwarding each call.

// TODO: top-level val appVersion: String by lazy { ... }
// Returns "1.0.0-<epochSeconds>"

fun main() {
    // val cache: Cache<String, Int> = LoggingCache(InMemoryCache())
    // cache.put("x", 42)    // prints: PUT x
    // println(cache.get("x"))  // prints: GET x, then 42
    // cache.invalidate("x")  // prints: INVALIDATE x
    // println(cache.size)    // 0
    // println(appVersion)    // 1.0.0-<timestamp>
}
