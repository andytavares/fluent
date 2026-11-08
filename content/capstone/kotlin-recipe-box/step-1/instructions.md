# Step 1 — Health endpoint

This is the first ticket on the board. Start a bare Kotlin HTTP server
and make it reachable before any recipe logic exists. Every later step
needs a server that listens and answers, so this step is the smoke test
for the capstone.

Your session has no framework: no Ktor, no Spring. The only library from
Maven Central is the Postgres JDBC driver, which you use from Step 2.
Ktor is *not* available here. This capstone uses the JDK HTTP server,
`com.sun.net.httpserver.HttpServer`. It is a Java API, and Kotlin can
use all of it.

## The task

Add a handler for `GET /health`. It returns status `200` and this exact
JSON body:

```json
{ "status": "ok" }
```

Sample request and response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

Your entrypoint is `Main.kt` with a top-level `fun main()`. The Kotlin
compiler turns it into a class named `MainKt`. The run loop runs that
class, so you do not need to do anything. A minimal server looks like
this:

```kotlin
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress

fun main() {
  val server = HttpServer.create(
    InetSocketAddress(8080), 0
  )

  server.createContext("/health") {
      exchange ->
    val body = """{"status":"ok"}"""
      .toByteArray()
    exchange.responseHeaders.set(
      "Content-Type", "application/json"
    )
    exchange.sendResponseHeaders(
      200, body.size.toLong()
    )
    exchange.responseBody.write(body)
    exchange.close()
  }

  server.executor = null
  server.start()
}
```

`HttpHandler` is a Java functional interface with one method,
`handle(exchange: HttpExchange)`. A trailing lambda works for each
route. `exchange.close()` flushes and closes the response stream in one
call. The code matches the Java version, but Kotlin turns the
`getX()`/`setX()` calls into properties.

This capstone models a recipe box. A recipe has an ingredient list and
an optional cook time. Each recipe has an average of its ratings. Later
steps use Kotlin null-safety (`Int?`, `?:`, safe calls) for fields that
can be absent. Examples are a recipe's `minutes`, or its average rating
before anyone rates it. Get the server skeleton working here first.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server
  setup.
- The response body must be valid JSON with a `status` key. Its value
  must be exactly `"ok"` (case-sensitive).
