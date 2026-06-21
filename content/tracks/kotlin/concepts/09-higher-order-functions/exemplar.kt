fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C = { x -> f(g(x)) }

fun <T> memoize(fn: (T) -> T): (T) -> T {
    val cache = mutableMapOf<T, T>()
    return { input -> cache.getOrPut(input) { fn(input) } }
}

fun pipeline(vararg fns: (Int) -> Int): (Int) -> Int =
    fns.fold({ x: Int -> x }) { acc, fn -> { x -> fn(acc(x)) } }

inline fun <T> timed(label: String, block: () -> T): T {
    val start = System.currentTimeMillis()
    val result = block()
    println("$label: ${System.currentTimeMillis() - start}ms")
    return result
}

fun main() {
    val addOne: (Int) -> Int = { it + 1 }
    val double: (Int) -> Int = { it * 2 }
    val addOneThenDouble = compose(double, addOne)
    println(addOneThenDouble(3))   // 8

    var callCount = 0
    val expensive = memoize<Int> { n -> callCount++; n * n }
    println(expensive(4))   // 16
    println(expensive(4))   // 16 (cached)
    println(callCount)      // 1

    val pipe = pipeline({ it + 1 }, { it * 2 }, { it - 3 })
    println(pipe(5))        // 9
}
