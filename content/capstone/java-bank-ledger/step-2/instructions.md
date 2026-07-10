# Step 2 — POST /accounts

With the server up from Step 1, it's time to add persistence. This step
introduces the `accounts` and `entries` tables and the first write path
the rest of the capstone builds on — every later step reads or mutates
rows this endpoint creates.

## The task

Add a handler for `POST /accounts` that creates an account and persists
it in Postgres.

**Request body:**

```json
{ "owner": "Alice" }
```

**Response:** `201 Created` with the inserted row. New accounts always
start at a zero balance:

```json
{
  "id": 1,
  "owner": "Alice",
  "balance_cents": 0
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

- Your server should create the `accounts` and `entries` tables itself on
  startup if they don't already exist:

  ```sql
  CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    owner TEXT NOT NULL,
    balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    amount_cents BIGINT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  The `CHECK (balance_cents >= 0)` constraint is your last line of defense
  against a bug that lets a balance go negative — every later step's
  application logic should never rely on the database to catch that for
  you, but it's there as a safety net.

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

- Validate that `owner` is present and non-empty in the request body. If
  it's missing, return `400 Bad Request`.
- Use a `PreparedStatement` with `RETURNING id, owner, balance_cents` so
  the database hands back the generated `id` and default `balance_cents`
  in one round trip. Build the response JSON by hand — string formatting
  is fine for a fixed, small response shape like this one.
