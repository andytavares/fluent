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
    println("celsiusToFahrenheit")
    test("0°C is 32°F") { assertNear(32.0, celsiusToFahrenheit(0.0)) }
    test("100°C is 212°F") { assertNear(212.0, celsiusToFahrenheit(100.0)) }
    test("-40°C is -40°F") { assertNear(-40.0, celsiusToFahrenheit(-40.0)) }
    test("37°C is 98.6°F") { assertNear(98.6, celsiusToFahrenheit(37.0)) }

    println("greet")
    test("non-null name") { assertEquals("Hello, Ada!", greet("Ada")) }
    test("null name") { assertEquals("Hello, stranger!", greet(null)) }
    test("blank name") { assertEquals("Hello, stranger!", greet("  ")) }
    test("empty name") { assertEquals("Hello, stranger!", greet("")) }

    println("describeNumber")
    test("positive") { assertEquals("positive", describeNumber(5)) }
    test("negative") { assertEquals("negative", describeNumber(-1)) }
    test("zero") { assertEquals("zero", describeNumber(0)) }
    test("large positive") { assertEquals("positive", describeNumber(Int.MAX_VALUE)) }
    test("large negative") { assertEquals("negative", describeNumber(Int.MIN_VALUE)) }

    println("initials")
    test("two names") { assertEquals("A.L.", initials("Ada Lovelace")) }
    test("three names") { assertEquals("A.B.C.", initials("Alan Brian Charles")) }
    test("single name") { assertEquals("K.", initials("Kotlin")) }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
