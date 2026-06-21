import kotlinx.coroutines.*

suspend fun retry(times: Int, block: suspend () -> String): String {
    var lastError: Exception? = null
    repeat(times) {
        try { return block() }
        catch (e: Exception) { lastError = e }
    }
    throw lastError!!
}

suspend fun fetchAll(ids: List<Int>, fetch: suspend (Int) -> String): List<String> =
    coroutineScope {
        ids.map { async { fetch(it) } }.map { it.await() }
    }

suspend fun withTimeout(ms: Long, block: suspend () -> String): String? =
    withTimeoutOrNull(ms) { block() }

fun main() = runBlocking {
    var attempts = 0
    val result = retry(3) {
        attempts++
        if (attempts < 3) throw Exception("fail") else "ok"
    }
    println(result)  // ok

    val results = fetchAll(listOf(1, 2, 3)) { id -> "item-$id" }
    println(results)  // [item-1, item-2, item-3]
}
