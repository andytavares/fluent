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
    println("evaluate")
    test("Num") { assertNear(42.0, evaluate(Expr.Num(42.0))) }
    test("Add") { assertNear(5.0, evaluate(Expr.Add(Expr.Num(2.0), Expr.Num(3.0)))) }
    test("Mul") { assertNear(6.0, evaluate(Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))) }
    test("Neg") { assertNear(-4.0, evaluate(Expr.Neg(Expr.Num(4.0)))) }
    test("nested Add+Mul") {
        val e = Expr.Add(Expr.Num(1.0), Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))
        assertNear(7.0, evaluate(e))
    }
    test("double negation") {
        assertNear(5.0, evaluate(Expr.Neg(Expr.Neg(Expr.Num(5.0)))))
    }
    test("zero") { assertNear(0.0, evaluate(Expr.Num(0.0))) }

    println("describe")
    test("Num") { assertEquals("42.0", describe(Expr.Num(42.0))) }
    test("Add") { assertEquals("(1.0 + 2.0)", describe(Expr.Add(Expr.Num(1.0), Expr.Num(2.0)))) }
    test("Mul") { assertEquals("(2.0 * 3.0)", describe(Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))) }
    test("Neg") { assertEquals("(-4.0)", describe(Expr.Neg(Expr.Num(4.0)))) }
    test("nested") {
        val e = Expr.Add(Expr.Num(1.0), Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))
        assertEquals("(1.0 + (2.0 * 3.0))", describe(e))
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
