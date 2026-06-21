interface Cache<K, V> {
    fun get(key: K): V?
    fun put(key: K, value: V)
    fun invalidate(key: K)
    val size: Int
}

class InMemoryCache<K, V> : Cache<K, V> {
    private val store = HashMap<K, V>()

    override fun get(key: K): V? = store[key]
    override fun put(key: K, value: V) { store[key] = value }
    override fun invalidate(key: K) { store.remove(key) }
    override val size: Int get() = store.size
}

class LoggingCache<K, V>(private val delegate: Cache<K, V>) : Cache<K, V> by delegate {
    override fun get(key: K): V? {
        println("GET $key")
        return delegate.get(key)
    }

    override fun put(key: K, value: V) {
        println("PUT $key")
        delegate.put(key, value)
    }

    override fun invalidate(key: K) {
        println("INVALIDATE $key")
        delegate.invalidate(key)
    }
}

val appVersion: String by lazy { "1.0.0-${System.currentTimeMillis() / 1000}" }

fun main() {
    val cache: Cache<String, Int> = LoggingCache(InMemoryCache())
    cache.put("x", 42)
    println(cache.get("x"))
    cache.invalidate("x")
    println(cache.size)
    println(appVersion)
}
