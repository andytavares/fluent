var passed = 0
var failed = 0

fun test(name: String, block: () -> Unit) {
    try {
        block()
        println("  PASS: $name")
        passed++
    } catch (e: Exception) {
        println("  FAIL: $name — ${e.message}")
        failed++
    }
}

fun assertEquals(expected: Any?, actual: Any?, msg: String = "") {
    if (expected != actual) throw Exception("expected $expected but got $actual${if (msg.isNotEmpty()) " ($msg)" else ""}")
}

fun main() {
    println("fibonacciSequence")
    test("first 6") {
        assertEquals(listOf(0L, 1L, 1L, 2L, 3L, 5L), fibonacciSequence().take(6).toList())
    }
    test("first 1") {
        assertEquals(listOf(0L), fibonacciSequence().take(1).toList())
    }
    test("first 10") {
        assertEquals(listOf(0L, 1L, 1L, 2L, 3L, 5L, 8L, 13L, 21L, 34L), fibonacciSequence().take(10).toList())
    }
    test("is lazy — infinite source doesn't hang when bounded") {
        val result = fibonacciSequence().filter { it % 2 == 0L }.take(3).toList()
        assertEquals(listOf(0L, 2L, 8L), result)
    }

    println("pairwise")
    test("basic") {
        assertEquals(listOf(1 to 2, 2 to 3, 3 to 4), pairwise(sequenceOf(1, 2, 3, 4)).toList())
    }
    test("single element yields nothing") {
        assertEquals(emptyList<Pair<Int, Int>>(), pairwise(sequenceOf(1)).toList())
    }
    test("empty yields nothing") {
        assertEquals(emptyList<Pair<Int, Int>>(), pairwise(sequenceOf<Int>()).toList())
    }
    test("two elements yields one pair") {
        assertEquals(listOf("a" to "b"), pairwise(sequenceOf("a", "b")).toList())
    }

    println("countdown")
    test("from 3") { assertEquals(listOf(3, 2, 1, 0), countdown(3).toList()) }
    test("from 0") { assertEquals(listOf(0), countdown(0).toList()) }
    test("from 1") { assertEquals(listOf(1, 0), countdown(1).toList()) }
    test("terminates without take") {
        // If countdown relied on an infinite loop, toList() here would hang the test.
        assertEquals(listOf(5, 4, 3, 2, 1, 0), countdown(5).toList())
    }

    println("interleave")
    test("equal lengths") {
        assertEquals(listOf(1, 2, 3, 4, 5, 6), interleave(sequenceOf(1, 3, 5), sequenceOf(2, 4, 6)).toList())
    }
    test("a longer than b") {
        assertEquals(listOf(1, 2, 3, 4, 5), interleave(sequenceOf(1, 3, 5), sequenceOf(2, 4)).toList())
    }
    test("b longer than a") {
        assertEquals(listOf(1, 2, 4), interleave(sequenceOf(1), sequenceOf(2, 4)).toList())
    }
    test("a empty") {
        assertEquals(listOf(1, 2), interleave(sequenceOf<Int>(), sequenceOf(1, 2)).toList())
    }
    test("both empty") {
        assertEquals(emptyList<Int>(), interleave(sequenceOf<Int>(), sequenceOf<Int>()).toList())
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
