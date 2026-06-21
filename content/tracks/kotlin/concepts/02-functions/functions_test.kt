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
    println("repeat")
    test("default times=2") { assertEquals("haha", repeat("ha")) }
    test("explicit times") { assertEquals("ababab", repeat("ab", 3)) }
    test("times=1") { assertEquals("x", repeat("x", 1)) }
    test("times=0") { assertEquals("", repeat("x", 0)) }

    println("wordCount")
    test("two words") { assertEquals(2, "hello world".wordCount()) }
    test("leading/trailing spaces") { assertEquals(2, "  foo bar  ".wordCount()) }
    test("multiple spaces between") { assertEquals(3, "a  b   c".wordCount()) }
    test("empty string") { assertEquals(0, "".wordCount()) }
    test("single word") { assertEquals(1, "kotlin".wordCount()) }

    println("joinWith")
    test("default separator") { assertEquals("a, b, c", joinWith("a", "b", "c")) }
    test("custom separator") { assertEquals("a|b|c", joinWith("a", "b", "c", separator = "|")) }
    test("single part") { assertEquals("only", joinWith("only")) }
    test("empty string parts") { assertEquals(", ", joinWith("", "")) }

    println("pow")
    test("2 pow 10") { assertEquals(1024, 2 pow 10) }
    test("5 pow 0") { assertEquals(1, 5 pow 0) }
    test("3 pow 3") { assertEquals(27, 3 pow 3) }
    test("1 pow 100") { assertEquals(1, 1 pow 100) }
    test("10 pow 3") { assertEquals(1000, 10 pow 3) }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
