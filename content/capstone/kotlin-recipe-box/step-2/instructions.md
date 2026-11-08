# Step 2 — POST /recipes

The server from Step 1 is up. Now add persistence. This step adds the
`recipes` and `ratings` tables and the first write path. Every later
step reads or changes rows that this endpoint creates.

Here Kotlin null-safety starts to help. A recipe's cook time (`minutes`)
is optional. Model it as `Int?`, not with a sentinel like `-1`. Then the
compiler makes you handle the "no cook time" case everywhere you use it.
You do not have to remember it yourself.

## The task

Add a handler for `POST /recipes`. It creates a recipe and stores it in
Postgres.

**Request body:**

```json
{
  "name": "Pancakes",
  "ingredients": ["flour", "milk", "eggs"],
  "minutes": 20
}
```

`minutes` is optional. The request can leave it out or set it to
`null`.

**Response:** `201 Created` with the inserted row, with `ingredients` as
a JSON array:

```json
{
  "id": 1,
  "name": "Pancakes",
  "ingredients": ["flour", "milk", "eggs"],
  "minutes": 20
}
```

When the request has no `minutes`:

```json
{
  "id": 2,
  "name": "Salad",
  "ingredients": ["lettuce"],
  "minutes": null
}
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it.
- Use `java.sql.DriverManager` and the `org.postgresql.Driver` JDBC
  driver. The session has the driver jar at a fixed classpath entry.
  Java uses the same driver, because JDBC is a Java API that Kotlin calls
  directly.
- No other third-party library is available. Your session has no
  network access per deploy, only this one driver jar.
- Your server must create the `recipes` and `ratings` tables on startup
  if they do not exist.
- Validate that `name` is present and `ingredients` is an array that is
  not empty. If either one is missing or empty, return
  `400 Bad Request`.
- Use a `PreparedStatement` with
  `RETURNING id, name, ingredients, minutes`. The database then returns
  the generated `id` in one round trip.
- Build the response JSON by hand. Render `ingredients` as a JSON array.
- When the `minutes` column is SQL `NULL`, render `minutes` as the
  literal `null`, with no quotes.

**The gotcha: the connection string.** `DATABASE_URL` is a standard
Postgres URI: `postgresql://user:pass@host:port/dbname`. JDBC uses a
different format: `jdbc:postgresql://host:port/dbname`. JDBC takes the
credentials as separate connection properties, not inside the URL. Parse
`DATABASE_URL` and build the JDBC URL again. `java.net.URI` already
splits a URI into host, port, path and user info:

```kotlin
import java.net.URI
import java.sql.Connection
import java.sql.DriverManager

fun connect(): Connection {
  val uri = URI(
    System.getenv("DATABASE_URL")
  )
  val (user, password) =
    uri.userInfo.split(":", limit = 2)
  val jdbcUrl = "jdbc:postgresql://" +
    "${uri.host}:${uri.port}${uri.path}"

  Class.forName("org.postgresql.Driver")
  return DriverManager.getConnection(
    jdbcUrl, user, password
  )
}
```

**The tables.** Run these statements on startup:

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
  recipe_id INTEGER NOT NULL
    REFERENCES recipes(id)
    ON DELETE CASCADE,
  stars INTEGER NOT NULL
    CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

`minutes` has no `NOT NULL`. The schema stores "no cook time" as SQL
`NULL`, which maps directly to the Kotlin `Int?`.

**The JSON body.** No JSON library is available: no
kotlinx.serialization, no Gson. For a small request body with a fixed,
known shape, hand-written extractors are enough. Do not add a dependency
that the session never fetched:

```kotlin
fun extractField(
  json: String, field: String
): String? =
  Regex("\"$field\"\\s*:\\s*\"([^\"]*)\"")
    .find(json)?.groupValues?.get(1)

// Nullable integer field:
// absent, `null`, or a number.
fun extractIntField(
  json: String, field: String
): Int? =
  Regex("\"$field\"\\s*:\\s*(-?\\d+)")
    .find(json)?.groupValues?.get(1)
    ?.toInt()

// A JSON string array like
// ["flour", "milk"].
fun extractStringArray(
  json: String, field: String
): List<String> {
  val pattern =
    Regex("\"$field\"\\s*:\\s*\\[(.*?)\\]")
  val arr = pattern.find(json)
    ?.groupValues?.get(1)
    ?: return emptyList()
  return Regex("\"([^\"]*)\"")
    .findAll(arr)
    .map { it.groupValues[1] }
    .toList()
}
```

Read the raw body with `exchange.requestBody`, which is an
`InputStream`. Decode it to a `String` with
`.readBytes().toString(Charsets.UTF_8)` before you extract fields.

**The arrays.** To write a Postgres array, make it with
`Connection.createArrayOf("text", ...)`. Bind it with
`PreparedStatement.setArray`:

```kotlin
val sqlArray = conn.createArrayOf(
  "text", ingredients.toTypedArray()
)
stmt.setArray(2, sqlArray)
```

To read it, use `ResultSet.getArray(...)`. Cast its `.array` to
`Array<*>` and map the items to strings:

```kotlin
val raw = rs.getArray("ingredients")
  .array as Array<*>
val ingredients = raw.map { it.toString() }
```

**The null.** `rs.getObject("minutes")` returns Kotlin `null` for a SQL
`NULL`. Branch on that value to write `null` or the number.
