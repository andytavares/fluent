import kotlinx.coroutines.*

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
    println("retry")
    test("succeeds on first try") {
        val result = runBlocking { retry(3) { "ok" } }
        assertEquals("ok", result)
    }
    test("succeeds after failures") {
        var attempts = 0
        val result = runBlocking {
            retry(3) {
                attempts++
                if (attempts < 3) throw Exception("not yet") else "done"
            }
        }
        assertEquals("done", result)
        assertEquals(3, attempts)
    }
    test("rethrows after exhausting attempts") {
        var threw = false
        try {
            runBlocking { retry(2) { throw Exception("always fails") } }
        } catch (e: Exception) {
            threw = true
            assertEquals("always fails", e.message)
        }
        if (!threw) throw Exception("expected exception to be thrown")
    }
    test("single attempt success") {
        val result = runBlocking { retry(1) { "one shot" } }
        assertEquals("one shot", result)
    }

    println("fetchAll")
    test("preserves order") {
        val result = runBlocking {
            fetchAll(listOf(3, 1, 2)) { id -> "item-$id" }
        }
        assertEquals(listOf("item-3", "item-1", "item-2"), result)
    }
    test("empty list") {
        val result = runBlocking { fetchAll(emptyList()) { "x" } }
        assertEquals(emptyList<String>(), result)
    }
    test("single item") {
        val result = runBlocking { fetchAll(listOf(7)) { id -> "id=$id" } }
        assertEquals(listOf("id=7"), result)
    }
    test("runs concurrently") {
        val start = System.currentTimeMillis()
        runBlocking {
            fetchAll(listOf(1, 2, 3)) { delay(100); "done" }
        }
        val elapsed = System.currentTimeMillis() - start
        // If sequential, would take ~300ms; concurrent should be ~100ms
        if (elapsed > 250) throw Exception("fetchAll appears sequential (took ${elapsed}ms, expected ~100ms)")
    }

    println("withTimeout")
    test("returns result when fast") {
        val result = runBlocking { withTimeout(1000) { "fast" } }
        assertEquals("fast", result)
    }
    test("returns null when slow") {
        val result = runBlocking {
            withTimeout(50) {
                delay(200)
                "too slow"
            }
        }
        assertEquals(null, result)
    }

    println("\n$passed passed, $failed failed")
    if (failed > 0) kotlin.system.exitProcess(1)
}
