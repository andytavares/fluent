# Step 2 — POST /recipes

With the server up from Step 1, it's time to add persistence. This step
introduces the `recipes` and `ratings` tables and the first write path
the rest of the capstone builds on — every later step reads or mutates
rows this endpoint creates.

This is also the first place Kotlin's null-safety earns its keep: a
recipe's cook time (`minutes`) is genuinely optional. Modeling that as
`Int?` instead of a sentinel like `-1` means the compiler forces you to
handle the "no cook time given" case everywhere you touch it, rather than
trusting yourself to remember.

## The task

Add a handler for `POST /recipes` that creates a recipe and persists it
in Postgres.

**Request body:**

```json
{ "name": "Pancakes", "ingredients": ["flour", "milk", "eggs"], "minutes": 20 }
```

`minutes` is optional — it may be omitted or explicitly `null`.

**Response:** `201 Created` with the inserted row, ingredients as a JSON
array:

```json
{
  "id": 1,
  "name": "Pancakes",
  "ingredients": ["flour", "milk", "eggs"],
  "minutes": 20
}
```

When `minutes` wasn't given:

```json
{ "id": 2, "name": "Salad", "ingredients": ["lettuce"], "minutes": null }
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

- Your server should create the `recipes` and `ratings` tables itself on
  startup if they don't already exist:

  ```sql
  CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  `minutes` has no `NOT NULL` — the schema itself models "no cook time
  given" as SQL `NULL`, which maps directly onto Kotlin's `Int?`.

- There's no JSON library available either (no kotlinx.serialization, no
  Gson). For a request body this small and with a fixed, known shape, a
  hand-rolled extractor is enough — don't reach for a dependency that was
  never fetched:

  ```kotlin
  fun extractField(json: String, field: String): String? =
    Regex("\"$field\"\\s*:\\s*\"([^\"]*)\"").find(json)?.groupValues?.get(1)

  // Nullable integer field: absent, `null`, or a number.
  fun extractIntField(json: String, field: String): Int? =
    Regex("\"$field\"\\s*:\\s*(-?\\d+)").find(json)?.groupValues?.get(1)?.toInt()

  // A JSON string array like ["flour", "milk"].
  fun extractStringArray(json: String, field: String): List<String> {
    val arr = Regex("\"$field\"\\s*:\\s*\\[(.*?)\\]").find(json)?.groupValues?.get(1) ?: return emptyList()
    return Regex("\"([^\"]*)\"").findAll(arr).map { it.groupValues[1] }.toList()
  }
  ```

  Read the raw body with `exchange.requestBody` (an `InputStream`) and
  decode it to a `String` (`.readBytes().toString(Charsets.UTF_8)`) before
  extracting fields.

- Validate that `name` is present and `ingredients` is a non-empty array.
  If either is missing/empty, return `400 Bad Request`.
- Postgres arrays need `Connection.createArrayOf("text", ...)` on the way
  in, bound with `PreparedStatement.setArray`:

  ```kotlin
  val sqlArray = conn.createArrayOf("text", ingredients.toTypedArray())
  stmt.setArray(2, sqlArray)
  ```

  and `ResultSet.getArray(...)` on the way out — cast its `.array` to
  `Array<*>` and map to strings:

  ```kotlin
  val raw = rs.getArray("ingredients").array as Array<*>
  val ingredients = raw.map { it.toString() }
  ```

- Use a `PreparedStatement` with `RETURNING id, name, ingredients, minutes`
  so the database hands back the generated `id` in one round trip. Build
  the response JSON by hand, rendering `ingredients` as a JSON array and
  `minutes` as the literal `null` (no quotes) when the column is SQL
  `NULL` — `rs.getObject("minutes")` returns Kotlin `null` for a SQL
  `NULL`, which is the natural place to branch.
