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
  fixed classpath entry). No other third-party library is available — your
  session has no network access per deploy, only this one pre-fetched
  driver jar.

  **The gotcha:** `DATABASE_URL` is a standard Postgres URI —
  `postgresql://user:pass@host:port/dbname` — but JDBC connection strings
  use a different format: `jdbc:postgresql://host:port/dbname`, with
  credentials passed as separate connection properties (not embedded in
  the URL). You need to parse `DATABASE_URL` and reassemble it. The
  simplest approach is `java.net.URI`, which already knows how to split a
  URI into host/port/path/userInfo for you:

  ```java
  import java.net.URI;
  import java.sql.Connection;
  import java.sql.DriverManager;

  static Connection connect() throws Exception {
    URI uri = new URI(System.getenv("DATABASE_URL"));
    String[] creds = uri.getUserInfo().split(":", 2);
    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();

    Class.forName("org.postgresql.Driver");
    return DriverManager.getConnection(jdbcUrl, creds[0], creds[1]);
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

  Run it once with `Connection.createStatement().execute(...)` right after
  you connect.

- There's no JSON library available either (no Jackson, no Gson). For a
  request body this small and with a fixed, known shape, a hand-rolled
  extractor is enough — don't reach for a dependency that was never
  fetched:

  ```java
  import java.util.regex.Matcher;
  import java.util.regex.Pattern;

  static String extractField(String json, String field) {
    Matcher m = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
    return m.find() ? m.group(1) : null;
  }
  ```

  Read the raw body with `exchange.getRequestBody()` (an `InputStream`)
  and decode it to a `String` before extracting fields.

- Validate that both `name` and `email` are present in the request body.
  If either is missing, return `400 Bad Request`.
- Use a `PreparedStatement` with `RETURNING id, name, email, created_at` so
  the database hands back the generated columns in one round trip. Build
  the response JSON by hand — string formatting is fine for a fixed,
  small response shape like this one.
