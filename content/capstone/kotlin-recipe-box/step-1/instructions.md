# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Kotlin HTTP server
running and reachable before any recipe logic exists. Every later step
assumes your server is already listening and healthy, so this is the
smoke test the rest of the capstone builds on.

Your session has no framework installed — no Ktor, no Spring, nothing
fetched from Maven Central except the Postgres JDBC driver you'll need
starting in Step 2. Ktor in particular is *not* available here, so this
capstone uses the JDK's own HTTP server, `com.sun.net.httpserver.HttpServer`
(fully usable from Kotlin — it's just a Java API).

## The task

Add a handler for `GET /health` that returns a JSON response with status
`200` and this exact body:

```json
{ "status": "ok" }
```

Sample request/response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

Your entrypoint is `Main.kt` — a top-level `fun main()`, which the Kotlin
compiler turns into a class named `MainKt` (that's the class the run loop
executes, no action needed on your part). A minimal server looks like
this:

```kotlin
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress

fun main() {
  val server = HttpServer.create(InetSocketAddress(8080), 0)

  server.createContext("/health") { exchange ->
    val body = """{"status":"ok"}""".toByteArray()
    exchange.responseHeaders.set("Content-Type", "application/json")
    exchange.sendResponseHeaders(200, body.size.toLong())
    exchange.responseBody.write(body)
    exchange.close()
  }

  server.executor = null
  server.start()
}
```

`HttpHandler` is a Java functional interface (`handle(exchange: HttpExchange)`),
so a trailing lambda works for each route. `exchange.close()` flushes and
closes the response stream in one call — same as the Java version, just
without the explicit `getX()`/`setX()` calls Kotlin turns into properties.

This capstone models a recipe box: recipes have an ingredient list and an
optional cook time, and ratings are aggregated per recipe. Later steps
lean on Kotlin's null-safety (`Int?`, `?:`, safe calls) to model fields
that genuinely may be absent — a recipe's `minutes`, or a recipe's
average rating before anyone has rated it. Get comfortable with the
server skeleton here first.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
