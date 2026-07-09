// fibonacciSequence lazily yields 0, 1, 1, 2, 3, 5, ... forever.
fun fibonacciSequence(): Sequence<Long> {
    // TODO
    return emptySequence()
}

// pairwise lazily yields consecutive pairs from seq: [a, b, c] -> [(a, b), (b, c)].
fun <T> pairwise(seq: Sequence<T>): Sequence<Pair<T, T>> {
    // TODO
    return emptySequence()
}

// countdown lazily yields from, from - 1, ..., 1, 0 and then stops.
fun countdown(from: Int): Sequence<Int> {
    // TODO
    return emptySequence()
}

// interleave lazily alternates elements from a and b, then drains whichever has leftovers.
fun <T> interleave(a: Sequence<T>, b: Sequence<T>): Sequence<T> {
    // TODO
    return emptySequence()
}

fun main() {
    println(fibonacciSequence().take(6).toList())              // [0, 1, 1, 2, 3, 5]
    println(pairwise(sequenceOf(1, 2, 3, 4)).toList())          // [(1, 2), (2, 3), (3, 4)]
    println(countdown(3).toList())                              // [3, 2, 1, 0]
    println(interleave(sequenceOf(1, 3, 5), sequenceOf(2, 4)).toList())  // [1, 2, 3, 4, 5]
}
