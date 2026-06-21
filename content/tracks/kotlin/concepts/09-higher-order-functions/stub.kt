// compose returns a function that applies g then f: (A) -> C
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    // TODO
    return { it as C }
}

// memoize returns a version of fn that caches results by input.
fun <T> memoize(fn: (T) -> T): (T) -> T {
    // TODO
    return fn
}

// pipeline returns a function that applies each fn left-to-right.
fun pipeline(vararg fns: (Int) -> Int): (Int) -> Int {
    // TODO
    return { it }
}

// timed runs block, prints "<label>: <ms>ms", and returns the result.
inline fun <T> timed(label: String, block: () -> T): T {
    // TODO
    return block()
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
    println(pipe(5))        // ((5+1)*2)-3 = 9
}
