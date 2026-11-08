# Step 2 — POST /accounts

The server from Step 1 is up. Now add persistence. This step adds the
`accounts` and `entries` tables and the first write path. Every later
step reads or changes rows that this endpoint creates.

## The task

Add a handler for `POST /accounts`. It creates an account and stores it
in Postgres.

**Request body:**

```json
{ "owner": "Alice" }
```

**Response:** `201 Created` with the inserted row. A new account always
starts at a zero balance:

```json
{
  "id": 1,
  "owner": "Alice",
  "balance_cents": 0
}
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it.
- Use `java.sql.DriverManager` and the `org.postgresql.Driver` JDBC
  driver. The session has the driver jar at a fixed classpath entry.
- No other third-party library is available. Your session has no
  network access per deploy, only this one driver jar.
- Your server must create the `accounts` and `entries` tables on startup
  if they do not exist.
- Validate that `owner` is present and not empty in the request body. If
  it is missing, return `400 Bad Request`.
- Use a `PreparedStatement` with `RETURNING id, owner, balance_cents`.
  The database then returns the generated `id` and the default
  `balance_cents` in one round trip.
- Build the response JSON by hand. String formatting is enough for a
  small, fixed response shape like this one.

**The gotcha: the connection string.** `DATABASE_URL` is a standard
Postgres URI: `postgresql://user:pass@host:port/dbname`. JDBC uses a
different format: `jdbc:postgresql://host:port/dbname`. JDBC takes the
credentials as separate connection properties, not inside the URL. Parse
`DATABASE_URL` and build the JDBC URL again. `java.net.URI` already
splits a URI into host, port, path and user info:

```java
import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;

static Connection connect()
    throws Exception {
  URI uri = new URI(
      System.getenv("DATABASE_URL"));
  String[] creds =
      uri.getUserInfo().split(":", 2);
  String jdbcUrl = "jdbc:postgresql://"
      + uri.getHost() + ":" + uri.getPort()
      + uri.getPath();

  Class.forName("org.postgresql.Driver");
  return DriverManager.getConnection(
      jdbcUrl, creds[0], creds[1]);
}
```

**The tables.** Run these statements on startup:

```sql
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  balance_cents BIGINT NOT NULL DEFAULT 0
    CHECK (balance_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL
    REFERENCES accounts(id),
  amount_cents BIGINT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN (
    'deposit', 'withdrawal',
    'transfer_in', 'transfer_out')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

The `CHECK (balance_cents >= 0)` constraint is your last line of defense
against a bug that makes a balance negative. Your application logic in
later steps must never rely on the database to catch that. The
constraint is only a safety net.

**The JSON body.** No JSON library is available: no Jackson, no Gson.
For a small request body with a fixed, known shape, a hand-written
extractor is enough. Do not add a dependency that the session never
fetched:

```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

static String extractField(
    String json, String field) {
  Pattern pattern = Pattern.compile(
      "\"" + field
      + "\"\\s*:\\s*\"([^\"]*)\"");
  Matcher m = pattern.matcher(json);
  return m.find() ? m.group(1) : null;
}
```

Read the raw body with `exchange.getRequestBody()`, which returns an
`InputStream`. Decode it to a `String` before you extract fields.
