# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates.

## The task

Add a handler for `POST /users` that creates a user and persists it in
Postgres.

**Request body:**

```json
{ "name": "Alice", "email": "alice@example.com" }
```

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `created_at` fields:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via `java.sql.DriverManager` and the
  `org.postgresql.Driver` JDBC driver (pre-fetched into your session at a
  fixed classpath entry — the same driver Java uses, since JDBC is a Java
  API you call directly from Kotlin). No other third-party library is
  available — your session has no network access per deploy, only this
  one pre-fetched driver jar.

  **The gotcha:** `DATABASE_URL` is a standard Postgres URI —
  `postgresql://user:pass@host:port/dbname` — but JDBC connection strings
  use a different format: `jdbc:postgresql://host:port/dbname`, with
  credentials passed as separate connection properties (not embedded in
  the URL). You need to parse `DATABASE_URL` and reassemble it. The
  simplest approach is `java.net.URI`, which already knows how to split a
  URI into host/port/path/userInfo for you:

  ```kotlin
  import java.net.URI
  import java.sql.Connection
  import java.sql.DriverManager

  fun connect(): Connection {
    val uri = URI(System.getenv("DATABASE_URL"))
    val (user, password) = uri.userInfo.split(":", limit = 2)
    val jdbcUrl = "jdbc:postgresql://${uri.host}:${uri.port}${uri.path}"

    Class.forName("org.postgresql.Driver")
    return DriverManager.getConnection(jdbcUrl, user, password)
  }
  ```

- Your server should create the `users` table itself on startup if it
  doesn't already exist, e.g.:

  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  Run it once with `connection.createStatement().execute(...)` right
  after you connect.

- There's no JSON library available either (no kotlinx.serialization, no
  Gson). For a request body this small and with a fixed, known shape, a
  hand-rolled extractor is enough — don't reach for a dependency that was
  never fetched:

  ```kotlin
  fun extractField(json: String, field: String): String? =
    Regex("\"$field\"\\s*:\\s*\"([^\"]*)\"").find(json)?.groupValues?.get(1)
  ```

  Read the raw body with `exchange.requestBody` (an `InputStream`) and
  decode it to a `String` (`.readBytes().toString(Charsets.UTF_8)`) before
  extracting fields.

- Validate that both `name` and `email` are present in the request body.
  If either is missing, return `400 Bad Request`.
- Use a `PreparedStatement` with `RETURNING id, name, email, created_at` so
  the database hands back the generated columns in one round trip. Build
  the response JSON by hand — string templates are fine for a fixed,
  small response shape like this one.
