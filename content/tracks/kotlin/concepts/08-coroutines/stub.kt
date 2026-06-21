import kotlinx.coroutines.*

// retry calls block up to `times` times, returning on first success.
// Rethrows the last exception if all attempts fail.
suspend fun retry(times: Int, block: suspend () -> String): String {
    // TODO
    return ""
}

// fetchAll fetches all IDs concurrently and returns results in order.
suspend fun fetchAll(ids: List<Int>, fetch: suspend (Int) -> String): List<String> {
    // TODO
    return emptyList()
}

// withTimeout runs block and returns null if it exceeds ms milliseconds.
suspend fun withTimeout(ms: Long, block: suspend () -> String): String? {
    // TODO
    return null
}

fun main() = runBlocking {
    // var attempts = 0
    // val result = retry(3) {
    //     attempts++
    //     if (attempts < 3) throw Exception("fail") else "ok"
    // }
    // println(result)  // ok
}
