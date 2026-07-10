# Step 4 — Visitor count

A quick aggregate endpoint: the total number of entries ever signed. It's
the simplest query in the capstone, and a good moment to look closely at
what `libpq` actually hands you back.

## The task

Add a handler for `GET /count` that returns the total number of entries.

**Sample request/response:**

```
GET /count

200 OK
Content-Type: application/json

{"count":7}
```

### `PQgetvalue` always returns text

`PQexec`/`PQexecParams` with `resultFormat = 0` return every column as
text, regardless of the column's SQL type — `COUNT(*)` returns a SQL
`bigint`, but `PQgetvalue` hands you back a plain C string like `"7"`. For
this endpoint you don't even need to parse it into an integer: it's going
straight back out as the value of a JSON field, so you can splice the
string `libpq` gave you directly into your response with `%s`:

```c
PGresult *res = PQexec(conn, "SELECT COUNT(*) FROM entries");
if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    // query failed — inspect PQerrorMessage(conn)
}

const char *count = PQgetvalue(res, 0, 0);

char body[64];
snprintf(body, sizeof(body), "{\"count\":%s}", count);
PQclear(res);
```

No `atoi`, no `strtol` — the text `libpq` returns for a numeric column is
already valid JSON for a number, as long as you don't wrap it in quotes.

Requirements:

- Return `200` with `{"count": N}` where `N` is the total number of rows
  in the `entries` table.
- Use a single `SELECT COUNT(*)` query — don't fetch every row and count
  them client-side.
- Call `PQclear()` on the result once you're done reading from it.
