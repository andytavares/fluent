# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Java HTTP server running
and reachable before any database logic exists. Every later step assumes
your server is already listening and healthy, so this is the smoke test the
rest of the capstone builds on.

Your session has no framework installed — no Spring, no Javalin, nothing
fetched from Maven Central except the Postgres JDBC driver you'll need
starting in Step 2. The JDK ships its own HTTP server,
`com.sun.net.httpserver.HttpServer`, and that's what every step of this
capstone uses.

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

Your entrypoint is `Main.java` — a top-level public class named `Main` with
a `public static void main(String[] args)`. A minimal server looks like
this:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class Main {
  public static void main(String[] args) throws Exception {
    HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

    server.createContext("/health", exchange -> {
      byte[] body = "{\"status\":\"ok\"}".getBytes();
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, body.length);
      exchange.getResponseBody().write(body);
      exchange.close();
    });

    server.setExecutor(null);
    server.start();
  }
}
```

`HttpHandler` is a functional interface (`void handle(HttpExchange exchange)
throws IOException`), so a lambda works for each route. `setExecutor(null)`
tells the server to run handlers on its own default executor, which is
fine for a capstone-scale server.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
