# Step 1 — Health endpoint

This is the first ticket on the board. Start a bare Java HTTP server and
make it reachable before any ledger logic exists. Every later step needs
a server that listens and answers, so this step is the smoke test for
the capstone.

Your session has no framework: no Spring, no Javalin. The only library
from Maven Central is the Postgres JDBC driver, which you use from
Step 2. The JDK has its own HTTP server,
`com.sun.net.httpserver.HttpServer`. Every step of this capstone uses
it.

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

Your entrypoint is `Main.java`: a top-level public class `Main` with a
`public static void main(String[] args)`. A minimal server looks like
this:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class Main {
  public static void main(
      String[] args) throws Exception {
    HttpServer server = HttpServer.create(
        new InetSocketAddress(8080), 0);

    server.createContext(
        "/health", exchange -> {
      byte[] body = "{\"status\":\"ok\"}"
          .getBytes();
      exchange.getResponseHeaders().set(
          "Content-Type",
          "application/json");
      exchange.sendResponseHeaders(
          200, body.length);
      exchange.getResponseBody()
          .write(body);
      exchange.close();
    });

    server.setExecutor(null);
    server.start();
  }
}
```

`HttpHandler` is a functional interface with one method,
`void handle(HttpExchange exchange) throws IOException`. A lambda works
for each route. `setExecutor(null)` makes the server run handlers on its
default executor. That is enough for a capstone-scale server.

This capstone models a bank ledger. Accounts hold a balance in cents.
Each deposit, withdrawal and transfer writes an immutable `entries` row.
Later steps use JDBC transactions (`setAutoCommit(false)`, `commit()`,
`rollback()`) to keep balance updates and entry writes atomic. Get the
server skeleton working here first.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server
  setup.
- The response body must be valid JSON with a `status` key. Its value
  must be exactly `"ok"` (case-sensitive).
