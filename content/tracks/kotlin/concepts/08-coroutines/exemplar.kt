fun fibonacciSequence(): Sequence<Long> = sequence {
    var a = 0L
    var b = 1L
    while (true) {
        yield(a)
        val next = a + b
        a = b
        b = next
    }
}

fun <T> pairwise(seq: Sequence<T>): Sequence<Pair<T, T>> = sequence {
    val iter = seq.iterator()
    if (!iter.hasNext()) return@sequence
    var prev = iter.next()
    while (iter.hasNext()) {
        val curr = iter.next()
        yield(prev to curr)
        prev = curr
    }
}

fun countdown(from: Int): Sequence<Int> = sequence {
    var n = from
    while (n >= 0) {
        yield(n)
        n--
    }
}

fun <T> interleave(a: Sequence<T>, b: Sequence<T>): Sequence<T> = sequence {
    val iterA = a.iterator()
    val iterB = b.iterator()
    while (iterA.hasNext() || iterB.hasNext()) {
        if (iterA.hasNext()) yield(iterA.next())
        if (iterB.hasNext()) yield(iterB.next())
    }
}

fun main() {
    println(fibonacciSequence().take(6).toList())              // [0, 1, 1, 2, 3, 5]
    println(pairwise(sequenceOf(1, 2, 3, 4)).toList())          // [(1, 2), (2, 3), (3, 4)]
    println(countdown(3).toList())                              // [3, 2, 1, 0]
    println(interleave(sequenceOf(1, 3, 5), sequenceOf(2, 4)).toList())  // [1, 2, 3, 4, 5]
}
