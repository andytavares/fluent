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

fun assertNear(expected: Double, actual: Double, epsilon: Double = 0.001) {
    if (Math.abs(expected - actual) > epsilon)
        throw Exception("expected ~$expected but got $actual")
}

fun main() {
    println("firstNonNull")
    test("skips null") { assertEquals("hello", firstNonNull(null, "hello")) }
    test("skips blank") { assertEquals("hello", firstNonNull("", "  ", "hello")) }
    test("returns first valid") { assertEquals("a", firstNonNull("a", "b")) }
    test("all null returns null") { assertEquals(null, firstNonNull(null, null)) }
    test("all blank returns null") { assertEquals(null, firstNonNull("", "  ")) }
    test("mixed") { assertEquals("hello", firstNonNull(null, "", "hello", "world")) }

    println("safeDivide")
    test("normal division") { assertNear(5.0, safeDivide(10, 2)!!) }
    test("divide by zero") { assertEquals(null, safeDivide(10, 0)) }
    test("integer truncation avoided") { assertNear(0.5, safeDivide(1, 2)!!) }
    test("negative result") { assertNear(-2.5, safeDivide(-5, 2)!!) }

    println("parsePositiveInt")
    test("valid positive") { assertEquals(42, parsePositiveInt("42")) }
    test("null input") { assertEquals(null, parsePositiveInt(null)) }
    test("non-numeric") { assertEquals(null, parsePositiveInt("abc")) }
    test("zero") { assertEquals(null, parsePositiveInt("0")) }
    test("negative") { assertEquals(null, parsePositiveInt("-1")) }
    test("one") { assertEquals(1, parsePositiveInt("1")) }

    println("coalesce")
    test("primary wins") { assertEquals("a", coalesce("a", "b", "c")) }
    test("primary null falls to secondary") { assertEquals("b", coalesce(null, "b", "c")) }
    test("primary blank falls to secondary") { assertEquals("b", coalesce("  ", "b", "c")) }
    test("both null falls to fallback") { assertEquals("c", coalesce(null, null, "c")) }
    test("both blank falls to fallback") { assertEquals("c", coalesce("", "  ", "c")) }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
