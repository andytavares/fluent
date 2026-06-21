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
    println("compose")
    test("addOne then double") {
        val f = compose<Int, Int, Int>({ it * 2 }, { it + 1 })
        assertEquals(8, f(3))
    }
    test("double then addOne") {
        val f = compose<Int, Int, Int>({ it + 1 }, { it * 2 })
        assertEquals(7, f(3))
    }
    test("identity composed") {
        val f = compose<String, String, String>({ it }, { it.uppercase() })
        assertEquals("HELLO", f("hello"))
    }
    test("type change") {
        val f = compose<Int, String, Int>({ it.length }, { it.toString() })
        assertEquals(3, f(100))
    }

    println("memoize")
    test("returns correct result") {
        val sq = memoize<Int> { it * it }
        assertEquals(25, sq(5))
    }
    test("caches — only calls fn once per input") {
        var callCount = 0
        val fn = memoize<Int> { n -> callCount++; n * 2 }
        fn(3); fn(3); fn(3)
        assertEquals(1, callCount)
    }
    test("different inputs call fn separately") {
        var callCount = 0
        val fn = memoize<Int> { n -> callCount++; n }
        fn(1); fn(2); fn(1)
        assertEquals(2, callCount)
    }

    println("pipeline")
    test("left to right") {
        val p = pipeline({ it + 1 }, { it * 2 }, { it - 3 })
        assertEquals(9, p(5))   // (5+1)*2-3 = 9
    }
    test("empty pipeline is identity") {
        val p = pipeline()
        assertEquals(7, p(7))
    }
    test("single function") {
        val p = pipeline({ it * 10 })
        assertEquals(50, p(5))
    }
    test("order matters") {
        val p1 = pipeline({ it + 10 }, { it * 2 })
        val p2 = pipeline({ it * 2 }, { it + 10 })
        assertEquals(30, p1(5))   // (5+10)*2 = 30
        assertEquals(20, p2(5))   // (5*2)+10 = 20
    }

    println("timed")
    test("returns block result") {
        val result = timed("test") { 42 }
        assertEquals(42, result)
    }
    test("prints label") {
        val output = StringBuilder()
        val origOut = System.out
        val ps = java.io.PrintStream(object : java.io.OutputStream() {
            override fun write(b: Int) { output.append(b.toChar()) }
        })
        System.setOut(ps)
        timed("mytask") { "value" }
        System.setOut(origOut)
        val line = output.toString().trim()
        if (!line.startsWith("mytask:")) throw Exception("expected output starting with 'mytask:' but got '$line'")
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
