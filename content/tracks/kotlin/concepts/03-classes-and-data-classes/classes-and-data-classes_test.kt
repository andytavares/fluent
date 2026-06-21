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
    println("Money data class")
    test("structural equality") {
        val a = Money(10.0, "USD")
        val b = Money(10.0, "USD")
        assertEquals(a, b)
    }
    test("copy changes field") {
        val m = Money(10.0, "USD")
        val m2 = m.copy(amount = 20.0)
        assertEquals(20.0, m2.amount)
        assertEquals("USD", m2.currency)
    }
    test("toString") {
        val m = Money(5.0, "EUR")
        assertEquals("Money(amount=5.0, currency=EUR)", m.toString())
    }

    println("Money.format")
    test("USD integer") { assertEquals("USD 10.00", Money(10.0, "USD").format()) }
    test("EUR decimal") { assertEquals("EUR 42.50", Money(42.5, "EUR").format()) }
    test("zero") { assertEquals("USD 0.00", Money(0.0, "USD").format()) }
    test("large amount") { assertEquals("USD 1000.99", Money(1000.99, "USD").format()) }

    println("Money.add")
    test("same currency") {
        val result = Money(10.0, "USD").add(Money(5.0, "USD"))
        assertNear(15.0, result.amount)
        assertEquals("USD", result.currency)
    }
    test("different currency throws") {
        var threw = false
        try { Money(10.0, "USD").add(Money(5.0, "EUR")) }
        catch (e: IllegalArgumentException) { threw = true }
        if (!threw) throw Exception("expected IllegalArgumentException")
    }

    println("ExchangeRates")
    test("usdToEur") { assertNear(92.0, ExchangeRates.usdToEur(100.0)) }
    test("eurToUsd") { assertNear(108.69, ExchangeRates.eurToUsd(100.0)) }
    test("round-trip") { assertNear(100.0, ExchangeRates.eurToUsd(ExchangeRates.usdToEur(100.0)), 0.01) }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
