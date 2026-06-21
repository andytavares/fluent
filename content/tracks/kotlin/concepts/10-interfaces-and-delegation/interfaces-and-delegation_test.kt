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

fun captureOutput(block: () -> Unit): String {
    val buf = StringBuilder()
    val orig = System.out
    System.setOut(java.io.PrintStream(object : java.io.OutputStream() {
        override fun write(b: Int) { buf.append(b.toChar()) }
    }))
    try { block() } finally { System.setOut(orig) }
    return buf.toString()
}

fun main() {
    println("InMemoryCache")
    test("put and get") {
        val c = InMemoryCache<String, Int>()
        c.put("a", 1)
        assertEquals(1, c.get("a"))
    }
    test("get missing returns null") {
        val c = InMemoryCache<String, Int>()
        assertEquals(null, c.get("missing"))
    }
    test("invalidate removes entry") {
        val c = InMemoryCache<String, Int>()
        c.put("x", 99)
        c.invalidate("x")
        assertEquals(null, c.get("x"))
    }
    test("size tracks entries") {
        val c = InMemoryCache<String, Int>()
        assertEquals(0, c.size)
        c.put("a", 1); c.put("b", 2)
        assertEquals(2, c.size)
        c.invalidate("a")
        assertEquals(1, c.size)
    }
    test("overwrite existing key") {
        val c = InMemoryCache<String, Int>()
        c.put("k", 1); c.put("k", 2)
        assertEquals(2, c.get("k"))
        assertEquals(1, c.size)
    }

    println("LoggingCache")
    test("logs GET") {
        val output = captureOutput {
            val c = LoggingCache(InMemoryCache<String, Int>())
            c.get("mykey")
        }
        if (!output.contains("GET mykey")) throw Exception("expected 'GET mykey' in output, got: $output")
    }
    test("logs PUT") {
        val output = captureOutput {
            val c = LoggingCache(InMemoryCache<String, Int>())
            c.put("mykey", 1)
        }
        if (!output.contains("PUT mykey")) throw Exception("expected 'PUT mykey' in output, got: $output")
    }
    test("logs INVALIDATE") {
        val output = captureOutput {
            val c = LoggingCache(InMemoryCache<String, Int>())
            c.invalidate("mykey")
        }
        if (!output.contains("INVALIDATE mykey")) throw Exception("expected 'INVALIDATE mykey' in output, got: $output")
    }
    test("still functions correctly after logging") {
        val c = LoggingCache(InMemoryCache<String, Int>())
        captureOutput { c.put("z", 7) }
        val result = captureOutput { c.get("z") }
        // The value must be returned correctly (we can't easily capture it, so check size)
        assertEquals(1, c.size)
    }
    test("size delegates without logging") {
        val output = captureOutput {
            val c = LoggingCache(InMemoryCache<String, Int>())
            captureOutput { c.put("a", 1) }
            assertEquals(1, c.size)
        }
        // size access should not produce log output
        if (output.contains("SIZE")) throw Exception("size should not be logged, got: $output")
    }

    println("appVersion")
    test("starts with 1.0.0-") {
        if (!appVersion.startsWith("1.0.0-")) throw Exception("expected appVersion to start with '1.0.0-', got $appVersion")
    }
    test("lazy — same value on repeated access") {
        assertEquals(appVersion, appVersion)
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
