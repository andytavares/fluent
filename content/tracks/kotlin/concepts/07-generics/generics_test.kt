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
    println("clamp")
    test("within range") { assertEquals(5, clamp(5, 1, 10)) }
    test("below min") { assertEquals(0, clamp(-1, 0, 10)) }
    test("above max") { assertEquals(10, clamp(15, 0, 10)) }
    test("exactly min") { assertEquals(0, clamp(0, 0, 10)) }
    test("exactly max") { assertEquals(10, clamp(10, 0, 10)) }
    test("strings") { assertEquals("m", clamp("m", "a", "z")) }
    test("doubles") { assertEquals(0.5, clamp(0.5, 0.0, 1.0)) }
    test("double below") { assertEquals(0.0, clamp(-0.1, 0.0, 1.0)) }

    println("Stack")
    test("push and pop") {
        val s = Stack<Int>()
        s.push(1); s.push(2); s.push(3)
        assertEquals(3, s.pop())
        assertEquals(2, s.pop())
        assertEquals(1, s.pop())
    }
    test("pop empty returns null") {
        val s = Stack<String>()
        assertEquals(null, s.pop())
    }
    test("peek doesn't remove") {
        val s = Stack<Int>()
        s.push(42)
        assertEquals(42, s.peek())
        assertEquals(42, s.peek())
        assertEquals(1, s.size)
    }
    test("peek empty returns null") {
        assertEquals(null, Stack<Int>().peek())
    }
    test("size") {
        val s = Stack<String>()
        assertEquals(0, s.size)
        s.push("a"); s.push("b")
        assertEquals(2, s.size)
        s.pop()
        assertEquals(1, s.size)
    }
    test("LIFO order") {
        val s = Stack<String>()
        listOf("a", "b", "c").forEach { s.push(it) }
        val result = buildList { while (s.size > 0) add(s.pop()!!) }
        assertEquals(listOf("c", "b", "a"), result)
    }

    println("partition")
    test("splits strings from mixed") {
        val (strings, others) = partition<String>(listOf(1, "hello", 2, "world"))
        assertEquals(listOf("hello", "world"), strings)
        assertEquals(listOf(1, 2), others)
    }
    test("all match") {
        val (ints, others) = partition<Int>(listOf(1, 2, 3))
        assertEquals(listOf(1, 2, 3), ints)
        assertEquals(emptyList<Any>(), others)
    }
    test("none match") {
        val (ints, others) = partition<Int>(listOf("a", "b"))
        assertEquals(emptyList<Int>(), ints)
        assertEquals(listOf("a", "b"), others)
    }
    test("empty list") {
        val (a, b) = partition<String>(emptyList())
        assertEquals(emptyList<String>(), a)
        assertEquals(emptyList<Any>(), b)
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
