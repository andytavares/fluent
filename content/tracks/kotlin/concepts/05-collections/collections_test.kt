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
    println("topN")
    test("top 2 of 3") {
        val result = topN(mapOf("Alice" to 90, "Bob" to 95, "Carol" to 80), 2)
        assertEquals(listOf("Bob", "Alice"), result)
    }
    test("n larger than map") {
        val result = topN(mapOf("A" to 1, "B" to 2), 10)
        assertEquals(listOf("B", "A"), result)
    }
    test("n=1") {
        val result = topN(mapOf("X" to 5, "Y" to 10, "Z" to 3), 1)
        assertEquals(listOf("Y"), result)
    }
    test("empty map") {
        assertEquals(emptyList<String>(), topN(emptyMap(), 5))
    }
    test("tie-breaking preserves relative order") {
        val result = topN(mapOf("A" to 10, "B" to 10), 2)
        assertEquals(2, result.size)
    }

    println("wordFrequency")
    test("basic count") {
        val result = wordFrequency(listOf("a", "b", "a", "c", "b", "a"))
        assertEquals(3, result["a"])
        assertEquals(2, result["b"])
        assertEquals(1, result["c"])
    }
    test("single word") {
        assertEquals(mapOf("hello" to 1), wordFrequency(listOf("hello")))
    }
    test("empty list") {
        assertEquals(emptyMap<String, Int>(), wordFrequency(emptyList()))
    }
    test("case sensitive") {
        val result = wordFrequency(listOf("A", "a"))
        assertEquals(1, result["A"])
        assertEquals(1, result["a"])
    }

    println("flatten")
    test("basic") { assertEquals(listOf(1, 2, 3, 4), flatten(listOf(listOf(1, 2), listOf(3, 4)))) }
    test("empty sublists") { assertEquals(listOf(1, 2), flatten(listOf(emptyList(), listOf(1, 2), emptyList()))) }
    test("empty outer") { assertEquals(emptyList<Int>(), flatten(emptyList())) }
    test("single sublist") { assertEquals(listOf(5), flatten(listOf(listOf(5)))) }

    println("runningTotal")
    test("basic") { assertEquals(listOf(1, 3, 6, 10), runningTotal(listOf(1, 2, 3, 4))) }
    test("single element") { assertEquals(listOf(5), runningTotal(listOf(5))) }
    test("empty") { assertEquals(emptyList<Int>(), runningTotal(emptyList())) }
    test("negatives") { assertEquals(listOf(10, 7, 12), runningTotal(listOf(10, -3, 5))) }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
